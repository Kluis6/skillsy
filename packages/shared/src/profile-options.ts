export const PROVIDER_CATEGORIES = [
  'Tecnologia',
  'Design',
  'Marketing',
  'Consultoria',
  'Vendas',
  'Aulas',
  'Cozinha',
  'Doméstico',
  'Limpeza',
  'Marcenaria',
  'Manutenção',
  'Construção Civil',
  'Beleza',
  'Educação',
  'Saúde',
  'Eventos',
  'Jurídico',
  'Financeiro',
  'Assistência',
  'Reformas',
  'Automotivo',
  'Moda',
  'Bem Estar',
  'Pet Care',
  'Fotografia',
  'Música',
  'Idiomas',
  'Esportes',
  'Festas',
  'Transporte',
  'Outros',
] as const;

export const AVAILABILITY_OPTIONS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

export type ProviderCategory = '' | (typeof PROVIDER_CATEGORIES)[number];
export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number];
