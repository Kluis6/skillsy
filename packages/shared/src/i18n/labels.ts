// Values saved in Firestore in Portuguese (categories, service days) work as
// keys; these maps give the dictionary key of the label shown for each value
// (pt.json "labels"). No imports, so tests can run it with plain Node.

/** Category saved on profiles and opportunities → labels.category.<key>. */
export const CATEGORY_LABEL_KEYS: Record<string, string> = {
  Tecnologia: "technology",
  Design: "design",
  Marketing: "marketing",
  Consultoria: "consulting",
  Vendas: "sales",
  Aulas: "lessons",
  Cozinha: "cooking",
  Doméstico: "household",
  Limpeza: "cleaning",
  Marcenaria: "woodworking",
  Manutenção: "maintenance",
  "Construção Civil": "construction",
  Beleza: "beauty",
  Educação: "education",
  Saúde: "health",
  Eventos: "events",
  Jurídico: "legal",
  Financeiro: "finance",
  Assistência: "repairs",
  Reformas: "renovations",
  Automotivo: "automotive",
  Moda: "fashion",
  "Bem Estar": "wellness",
  "Pet Care": "petCare",
  Fotografia: "photography",
  Música: "music",
  Idiomas: "languages",
  Esportes: "sports",
  Festas: "parties",
  Transporte: "transport",
  Outros: "other",
};

/** Service day saved on profiles → labels.day.<key>. */
export const DAY_LABEL_KEYS: Record<string, string> = {
  Seg: "mon",
  Ter: "tue",
  Qua: "wed",
  Qui: "thu",
  Sex: "fri",
  Sáb: "sat",
  Dom: "sun",
};
