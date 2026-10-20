import type { Opportunity, OpportunityStatus, OpportunityUrgency } from "./types";
import { whatsappUrl } from "./contact";

const DAY_MS = 24 * 60 * 60 * 1000;

export const OPPORTUNITY_URGENCY = {
  normal: {
    label: "Sem pressa",
    help: "Pode ser atendido dentro do prazo normal de 30 dias.",
    rank: 1,
  },
  soon: {
    label: "Nos próximos dias",
    help: "Bom para oportunidades que precisam de retorno ainda esta semana.",
    rank: 2,
  },
  urgent: {
    label: "Urgente",
    help: "Use quando precisa de contato rápido. Não substitui emergência ou serviço público.",
    rank: 3,
  },
} as const satisfies Record<OpportunityUrgency, { label: string; help: string; rank: number }>;

export const OPPORTUNITY_URGENCIES = Object.keys(OPPORTUNITY_URGENCY) as OpportunityUrgency[];

/** Firestore timestamps arrive as { seconds } (plain) or Date. */
function toMillis(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === "object" && "seconds" in value) {
    return Number((value as { seconds: unknown }).seconds) * 1000;
  }
  return null;
}

/** "20 de out. de 2026", or "agora" while the server timestamp is pending. */
export function formatFirestoreDate(value: unknown) {
  const millis = toMillis(value);
  if (millis === null) return "agora";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(millis));
}

/** Active opportunities past expiresAt count as expired even before the daily
 * maintenance Function updates them. */
export function getOpportunityStatus(opportunity: Opportunity): OpportunityStatus {
  if (opportunity.status !== "active") return opportunity.status;
  const expiresAt = toMillis(opportunity.expiresAt);
  return expiresAt !== null && expiresAt <= Date.now() ? "expired" : "active";
}

export function needsOpportunityFollowUp(opportunity: Opportunity) {
  if (getOpportunityStatus(opportunity) !== "active") return false;
  const createdAt = toMillis(opportunity.createdAt);
  return createdAt !== null && Date.now() >= createdAt + 20 * DAY_MS;
}

/** Most urgent first, then newest. */
export function sortOpportunities(opportunities: Opportunity[]) {
  return [...opportunities].sort((a, b) => {
    const urgencyDiff =
      OPPORTUNITY_URGENCY[b.urgency || "normal"].rank -
      OPPORTUNITY_URGENCY[a.urgency || "normal"].rank;
    if (urgencyDiff) return urgencyDiff;
    return (toMillis(b.createdAt) ?? 0) - (toMillis(a.createdAt) ?? 0);
  });
}

/** WhatsApp link a professional uses to answer an opportunity. */
export function opportunityWhatsappUrl(opportunity: Opportunity, professionalName: string) {
  const brief = opportunity.description.replace(/\s+/g, " ").trim().slice(0, 130);
  const message = `Olá, eu sou membro ${professionalName}. Vi sua oportunidade de “${brief}” no Skillsy e acredito que posso ajudar.`;
  return whatsappUrl(opportunity.authorWhatsApp, message);
}
