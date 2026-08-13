const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");

initializeApp();

const DATABASE_ID = "ai-studio-e9c18d7d-4bd5-4d82-861f-0db605e4639a";
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
        title: "Seu pedido ainda precisa de ajuda?",
        message: `Já se passaram 20 dias desde “${opportunity.title}”. Conte se recebeu resposta e encerre o pedido se não precisar mais dele.`,
        opportunityId: item.id,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      batch.update(item.ref, { followUpNotifiedAt: FieldValue.serverTimestamp() });
    });
    logger.info("Opportunity maintenance complete", { expired: expired.size, reminders: reminders.length });
  },
);
