import type { ImageProps } from 'expo-image';

export type ServiceImage = ImageProps['source'];

// Photos generated for Skillsy (the same set the site uses in public/),
// cropped to 4:3 and compressed by hand for the app bundle.
const IMAGES = {
  construcao: require('../../assets/services/construcao.webp'),
  reformas: require('../../assets/services/reformas.webp'),
  manutencao: require('../../assets/services/manutencao.webp'),
  instalacao: require('../../assets/services/instalacao.webp'),
  marcenaria: require('../../assets/services/marcenaria.webp'),
  limpeza: require('../../assets/services/limpeza.webp'),
  cozinha: require('../../assets/services/cozinha.webp'),
  confeitaria: require('../../assets/services/confeitaria.webp'),
  assistencia: require('../../assets/services/assistencia.webp'),
  transporte: require('../../assets/services/transporte.webp'),
  saude: require('../../assets/services/saude.webp'),
  bemEstar: require('../../assets/services/bem-estar.webp'),
  beleza: require('../../assets/services/beleza.webp'),
  moda: require('../../assets/services/moda.webp'),
  aulas: require('../../assets/services/aulas.webp'),
  tecnologia: require('../../assets/services/tecnologia.webp'),
  consultoria: require('../../assets/services/consultoria.webp'),
  automotivo: require('../../assets/services/automotivo.webp'),
  vendas: require('../../assets/services/vendas.webp'),
  comunidade: require('../../assets/services/comunidade.webp'),
  procurando: require('../../assets/services/procurando.webp'),
} satisfies Record<string, ServiceImage>;

export const BANNER_IMAGES = { comunidade: IMAGES.comunidade, procurando: IMAGES.procurando };

/** A service card searches by the profession, not by category: many
 * professionals pick "Outros" and describe the trade in the profession. */
export type ServiceCard = { title: string; search: string; image: ServiceImage };

export type ServiceSection = { title: string; services: ServiceCard[] };

export const SERVICE_SECTIONS: ServiceSection[] = [
  {
    title: 'Reformas e reparos',
    services: [
      { title: 'Pedreiro', search: 'pedreiro', image: IMAGES.construcao },
      { title: 'Pintor', search: 'pintor', image: IMAGES.reformas },
      { title: 'Eletricista', search: 'eletricista', image: IMAGES.manutencao },
      { title: 'Marceneiro', search: 'marceneiro', image: IMAGES.marcenaria },
      { title: 'Montador e instalador', search: 'montador', image: IMAGES.instalacao },
    ],
  },
  {
    title: 'Para sua casa',
    services: [
      { title: 'Diarista', search: 'diarista', image: IMAGES.limpeza },
      { title: 'Cozinheira', search: 'cozinheira', image: IMAGES.cozinha },
      { title: 'Bolos e doces', search: 'doces', image: IMAGES.confeitaria },
      { title: 'Chaveiro', search: 'chaveiro', image: IMAGES.assistencia },
      { title: 'Frete e mudança', search: 'frete', image: IMAGES.transporte },
    ],
  },
  {
    title: 'Saúde e beleza',
    services: [
      { title: 'Cuidador de pessoas', search: 'cuidador', image: IMAGES.saude },
      { title: 'Fisioterapeuta', search: 'fisioterapeuta', image: IMAGES.bemEstar },
      { title: 'Manicure', search: 'manicure', image: IMAGES.beleza },
      { title: 'Costureira', search: 'costureira', image: IMAGES.moda },
    ],
  },
  {
    title: 'Aulas e negócios',
    services: [
      { title: 'Professor particular', search: 'aulas', image: IMAGES.aulas },
      { title: 'Desenvolvedor', search: 'desenvolvedor', image: IMAGES.tecnologia },
      { title: 'Contador e consultor', search: 'contador', image: IMAGES.consultoria },
      { title: 'Mecânico', search: 'mecânico', image: IMAGES.automotivo },
      { title: 'Vendas', search: 'vendas', image: IMAGES.vendas },
    ],
  },
];

/** Large card on the home screen, like GetNinjas' featured service. */
export const FEATURED_SERVICE = {
  title: 'Diarista',
  description: 'Faxina, limpeza pós-obra e diarista semanal ou mensal.',
  search: 'diarista',
  image: IMAGES.limpeza,
};

/** "Recomendados" on Buscar: the first service of each section. */
export const RECOMMENDED_SERVICES = SERVICE_SECTIONS.flatMap((section) => section.services[0]);
