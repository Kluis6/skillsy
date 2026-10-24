const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onMessagePublished } = require("firebase-functions/v2/pubsub");
const { logger } = require("firebase-functions");
const { GoogleAuth } = require("google-auth-library");

initializeApp();

const PROJECT_ID = "gen-lang-client-0463625624";
const DATABASE_ID = "(default)";
const REGION = "southamerica-east1";
const db = getFirestore(DATABASE_ID);

// One notification per user, type and item (opportunity or post).
function notificationRef(userId, itemId, type) {
  return db.doc(`users/${userId}/notifications/${type}_${itemId}`);
}

async function commitInChunks(items, write) {
  for (let index = 0; index < items.length; index += 450) {
    const batch = db.batch();
    items.slice(index, index + 450).forEach((item) => write(batch, item));
    await batch.commit();
  }
}

exports.notifyMatchingProfessionals = onDocumentCreated(
  { document: "opportunities/{opportunityId}", database: DATABASE_ID, region: REGION },
  async (event) => {
    const opportunity = event.data?.data();
    if (!opportunity || opportunity.status !== "active") return;

    const providers = await db.collection("users")
      .where("isProvider", "==", true)
      .where("category", "==", opportunity.category)
      .where("businessState", "==", opportunity.state)
      .get();

    const recipients = [];
    for (const provider of providers.docs) {
      const data = provider.data();
      if (provider.id === opportunity.authorId || data.isBlocked === true || data.isDeleted === true) continue;
      recipients.push(provider.id);
    }
    await commitInChunks(recipients, (batch, providerId) => {
      batch.set(notificationRef(providerId, event.params.opportunityId, "opportunity_match"), {
        type: "opportunity_match",
        title: `Nova oportunidade em ${opportunity.category}`,
        message: `${opportunity.title} — ${opportunity.neighborhood}, ${opportunity.city} (${opportunity.state})`,
        opportunityId: event.params.opportunityId,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    logger.info("Opportunity alerts created", { opportunityId: event.params.opportunityId, recipients: recipients.length });
  },
);

// Every member hears about a new article or job once, when an admin first
// publishes it. The id is fixed per post, so publishing it again after an
// edit or unpublish never repeats the alert (create fails on the existing doc).
exports.notifyMembersOfNewPost = onDocumentWritten(
  { document: "posts/{postId}", database: DATABASE_ID, region: REGION },
  async (event) => {
    const before = event.data?.before?.data();
    const post = event.data?.after?.data();
    if (!post || post.status !== "published" || before?.status === "published") return;

    const users = await db.collection("users").get();
    const isJob = post.category === "job";
    const writer = db.bulkWriter();
    writer.onWriteError((error) => error.code !== 6 /* ALREADY_EXISTS */ && error.failedAttempts < 3);
    let recipients = 0;
    for (const user of users.docs) {
      const data = user.data();
      if (user.id === post.authorId || data.isBlocked === true || data.isDeleted === true) continue;
      recipients += 1;
      writer.create(notificationRef(user.id, event.params.postId, "post_published"), {
        type: "post_published",
        title: isJob ? "Nova vaga publicada" : "Novo artigo publicado",
        message: post.title,
        postId: event.params.postId,
        postSlug: post.slug,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      }).catch(() => {});
    }
    await writer.close();
    logger.info("Post alerts created", { postId: event.params.postId, recipients });
  },
);

// Tokens FCM rejects for good: the app was uninstalled or the token rotated.
const DEAD_TOKEN_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

// Every notification the functions above create also goes to the user's
// phones (users/{uid}/devices, registered by the app). The app reads `type`
// to open Oportunidades (Mural or Minhas) or the article.
exports.sendPushNotification = onDocumentCreated(
  { document: "users/{userId}/notifications/{notificationId}", database: DATABASE_ID, region: REGION },
  async (event) => {
    const notification = event.data?.data();
    if (!notification) return;

    const devices = await db.collection(`users/${event.params.userId}/devices`).get();
    if (devices.empty) return;

    const response = await getMessaging().sendEachForMulticast({
      tokens: devices.docs.map((device) => device.id),
      notification: { title: notification.title, body: notification.message },
      data: {
        type: String(notification.type ?? ""),
        opportunityId: String(notification.opportunityId ?? ""),
        postSlug: String(notification.postSlug ?? ""),
      },
      android: {
        priority: "high",
        notification: { channelId: "oportunidades", color: "#007594" },
      },
    });

    const dead = devices.docs.filter((_, index) =>
      DEAD_TOKEN_ERRORS.has(response.responses[index].error?.code));
    await Promise.all(dead.map((device) => device.ref.delete()));
    logger.info("Push sent", {
      notificationId: event.params.notificationId,
      sent: response.successCount,
      failed: response.failureCount,
      removed: dead.length,
    });
  },
);

// "Fale conosco" messages can come from visitors without an account, who
// cannot write admin_notifications, so the bell notification is created here.
exports.notifyAdminsOfSupportMessage = onDocumentCreated(
  { document: "support_messages/{messageId}", database: DATABASE_ID, region: REGION },
  async (event) => {
    const message = event.data?.data();
    if (!message) return;
    const text = String(message.message || "");
    await db.collection("admin_notifications").add({
      title: "Nova mensagem de contato",
      message: `${message.name || "Visitante"}: ${text.length > 140 ? `${text.slice(0, 140)}…` : text}`,
      type: "support",
      read: false,
      link: "/admin/mensagens",
      createdAt: FieldValue.serverTimestamp(),
    });
  },
);

exports.maintainOpportunities = onSchedule(
  { schedule: "every day 09:00", timeZone: "America/Sao_Paulo", region: REGION },
  async () => {
    const now = Timestamp.now();
    const twentyDaysAgo = Timestamp.fromMillis(now.toMillis() - 20 * 24 * 60 * 60 * 1000);

    const [expired, followUps] = await Promise.all([
      db.collection("opportunities").where("status", "==", "active").where("expiresAt", "<=", now).get(),
      db.collection("opportunities").where("status", "==", "active").where("createdAt", "<=", twentyDaysAgo).get(),
    ]);

    await commitInChunks(expired.docs, (batch, item) => batch.update(item.ref, { status: "expired" }));

    const reminders = followUps.docs.filter((item) => {
      const opportunity = item.data();
      return !opportunity.followUpAnsweredAt &&
        !opportunity.followUpNotifiedAt &&
        opportunity.expiresAt?.toMillis?.() > now.toMillis();
    });
    await commitInChunks(reminders, (batch, item) => {
      const opportunity = item.data();
      batch.set(notificationRef(opportunity.authorId, item.id, "opportunity_follow_up"), {
        type: "opportunity_follow_up",
        title: "Sua oportunidade ainda precisa de ajuda?",
        message: `Já se passaram 20 dias desde “${opportunity.title}”. Conte se recebeu resposta e encerre a oportunidade se não precisar mais dela.`,
        opportunityId: item.id,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      batch.update(item.ref, { followUpNotifiedAt: FieldValue.serverTimestamp() });
    });
    logger.info("Opportunity maintenance complete", { expired: expired.size, reminders: reminders.length });
  },
);

// The monthly budget publishes to this topic a few times a day. Once the
// month's cost reaches the budget, billing is unlinked from the project:
// paid services stop and the project falls back to the free quotas until
// the billing account is linked again in the console. Data is kept.
// The runtime service account needs roles/billing.projectManager.
exports.stopBillingOverBudget = onMessagePublished(
  { topic: "billing-budget", region: REGION },
  async (event) => {
    const { costAmount, budgetAmount, currencyCode } = event.data.message.json;
    if (!(costAmount >= budgetAmount)) {
      logger.info("Budget ok", { costAmount, budgetAmount, currencyCode });
      return;
    }

    const client = await new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-billing"],
    }).getClient();
    const url = `https://cloudbilling.googleapis.com/v1/projects/${PROJECT_ID}/billingInfo`;
    const { data } = await client.request({ url });
    if (!data.billingEnabled) return;

    await client.request({ url, method: "PUT", data: { billingAccountName: "" } });
    logger.warn("Budget reached: billing disabled", { costAmount, budgetAmount, currencyCode });
  },
);
