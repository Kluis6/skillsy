const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onMessagePublished } = require("firebase-functions/v2/pubsub");
const { logger } = require("firebase-functions");
const { GoogleAuth } = require("google-auth-library");

initializeApp();

const PROJECT_ID = "gen-lang-client-0463625624";
const DATABASE_ID = "(default)";
const REGION = "southamerica-east1";
const db = getFirestore(DATABASE_ID);

function notificationRef(userId, opportunityId, type) {
  return db.doc(`users/${userId}/notifications/${type}_${opportunityId}`);
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

// Tokens FCM rejects for good: the app was uninstalled or the token rotated.
const DEAD_TOKEN_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

// Every notification the functions above create also goes to the user's
// phones (users/{uid}/devices, registered by the app). Tapping it opens the
// Oportunidades tab; the app reads `type` to pick Mural or Minhas.
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
