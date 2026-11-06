import type { ImageProps } from 'expo-image';
import type { MessageKey } from '@skillsy/shared/i18n/keys';

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
/** `title` is a message key (app.services.*); `search` stays Portuguese: it
 * matches the profiles' words. */
export type ServiceCard = { title: MessageKey; search: string; image: ServiceImage };

export type ServiceSection = { title: MessageKey; services: ServiceCard[] };

export const SERVICE_SECTIONS: ServiceSection[] = [
  {
    title: 'app.services.repairs',
    services: [
      { title: 'app.services.mason', search: 'pedreiro', image: IMAGES.construcao },
      { title: 'app.services.painter', search: 'pintor', image: IMAGES.reformas },
      { title: 'app.services.electrician', search: 'eletricista', image: IMAGES.manutencao },
      { title: 'app.services.woodworker', search: 'marceneiro', image: IMAGES.marcenaria },
      { title: 'app.services.installer', search: 'montador', image: IMAGES.instalacao },
    ],
  },
  {
    title: 'app.services.forYourHome',
    services: [
      { title: 'app.services.housekeeper', search: 'diarista', image: IMAGES.limpeza },
      { title: 'app.services.cook', search: 'cozinheira', image: IMAGES.cozinha },
      { title: 'app.services.sweets', search: 'doces', image: IMAGES.confeitaria },
      { title: 'app.services.locksmith', search: 'chaveiro', image: IMAGES.assistencia },
      { title: 'app.services.moving', search: 'frete', image: IMAGES.transporte },
    ],
  },
  {
    title: 'app.services.healthBeauty',
    services: [
      { title: 'app.services.caregiver', search: 'cuidador', image: IMAGES.saude },
      { title: 'app.services.physiotherapist', search: 'fisioterapeuta', image: IMAGES.bemEstar },
      { title: 'app.services.manicure', search: 'manicure', image: IMAGES.beleza },
      { title: 'app.services.seamstress', search: 'costureira', image: IMAGES.moda },
    ],
  },
  {
    title: 'app.services.lessonsBusiness',
    services: [
      { title: 'app.services.tutor', search: 'aulas', image: IMAGES.aulas },
      { title: 'app.services.developer', search: 'desenvolvedor', image: IMAGES.tecnologia },
      { title: 'app.services.accountant', search: 'contador', image: IMAGES.consultoria },
      { title: 'app.services.mechanic', search: 'mecânico', image: IMAGES.automotivo },
      { title: 'app.services.sales', search: 'vendas', image: IMAGES.vendas },
    ],
  },
];

/** Large card on the home screen, like GetNinjas' featured service. */
export const FEATURED_SERVICE = {
  title: 'app.services.housekeeper' as MessageKey,
  description: 'app.services.housekeeperText' as MessageKey,
  search: 'diarista',
  image: IMAGES.limpeza,
};

/** "Recomendados" on Buscar: the first service of each section. */
export const RECOMMENDED_SERVICES = SERVICE_SECTIONS.flatMap((section) => section.services[0]);
