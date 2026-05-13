export const REPORT_REASON_OPTIONS = [
  "informacao_falsa",
  "conteudo_ofensivo",
  "spam",
  "golpe_ou_fraude",
  "conduta_inadequada",
  "outro",
] as const;

export type ReportReason = (typeof REPORT_REASON_OPTIONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  informacao_falsa: "Informação falsa ou enganosa",
  conteudo_ofensivo: "Conteúdo ofensivo",
  spam: "Spam ou divulgação indevida",
  golpe_ou_fraude: "Suspeita de golpe ou fraude",
  conduta_inadequada: "Conduta inadequada",
  outro: "Outro motivo",
};
