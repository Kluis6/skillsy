import { UserProfile, type GalleryItem } from '@/models/types';

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
export interface ProfileGalleryItem {
  url: string;
  description: string;
}

type OptionalString = string | undefined;

export interface ProfileFormValues {
  name: string;
  bio: string;
  location: string;
  showPublicLocation: boolean;
  ward: string;
  serviceType: string;
  category: ProviderCategory;
  companyName: string;
  isProvider: boolean;
  whatsapp: string;
  phone: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  website: string;
  baptismYear: string;
  availability: AvailabilityOption[];
  serviceHours: string;
  photoURL: string;
  bannerURL: string;
  gallery: ProfileGalleryItem[];
  businessAddress: string;
  businessAddressNumber: string;
  businessNeighborhood: string;
  businessState: string;
  businessComplement: string;
}

const PROVIDER_ONLY_FIELDS = [
  'companyName',
  'category',
  'serviceType',
  'serviceHours',
  'businessAddress',
  'businessAddressNumber',
  'businessNeighborhood',
  'businessState',
  'businessComplement',
] as const;

const normalizeOptionalText = (value: unknown): OptionalString => {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeDigits = (value: unknown): OptionalString => {
  const normalized = normalizeOptionalText(value);
  return normalized ? normalized.replace(/\D/g, '') : undefined;
};

const normalizeCategory = (value: unknown): ProviderCategory => {
  if (typeof value !== 'string') return '';
  return PROVIDER_CATEGORIES.includes(value as (typeof PROVIDER_CATEGORIES)[number])
    ? (value as ProviderCategory)
    : '';
};

const normalizeAvailability = (value: unknown): AvailabilityOption[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((day): day is AvailabilityOption =>
    AVAILABILITY_OPTIONS.includes(day as AvailabilityOption),
  );
};

const normalizeGallery = (gallery: unknown): ProfileGalleryItem[] => {
  if (!Array.isArray(gallery)) return [];

  return gallery
    .map((item) => {
      if (typeof item === 'string') {
        const url = normalizeOptionalText(item);
        return url ? { url, description: '' } : null;
      }

      if (!item || typeof item !== 'object') return null;

      const maybeItem = item as { url?: unknown; description?: unknown };
      const url = normalizeOptionalText(maybeItem.url);
      if (!url) return null;

      return {
        url,
        description: normalizeOptionalText(maybeItem.description) || '',
      };
    })
    .filter((item): item is ProfileGalleryItem => item !== null)
    .slice(0, 5);
};

export const getProfileFormDefaults = (): ProfileFormValues => ({
  name: '',
  bio: '',
  location: '',
  showPublicLocation: false,
  ward: '',
  serviceType: '',
  category: '',
  companyName: '',
  isProvider: false,
  whatsapp: '',
  phone: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  website: '',
  baptismYear: '',
  availability: [],
  serviceHours: '',
  photoURL: '',
  bannerURL: '',
  gallery: [],
  businessAddress: '',
  businessAddressNumber: '',
  businessNeighborhood: '',
  businessState: '',
  businessComplement: '',
});

export const profileToFormValues = (profile: UserProfile | null): ProfileFormValues => {
  if (!profile) {
    return getProfileFormDefaults();
  }

  return {
    name: profile.name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    showPublicLocation: profile.showPublicLocation ?? false,
    ward: profile.ward || '',
    serviceType: profile.serviceType || '',
    category: normalizeCategory(profile.category),
    companyName: profile.companyName || '',
    isProvider: profile.isProvider || false,
    whatsapp: profile.whatsapp || '',
    phone: profile.phone || '',
    instagram: profile.instagram || '',
    facebook: profile.facebook || '',
    linkedin: profile.linkedin || '',
    website: profile.website || '',
    baptismYear: profile.baptismYear ? String(profile.baptismYear) : '',
    availability: normalizeAvailability(profile.availability),
    serviceHours: profile.serviceHours || '',
    photoURL: profile.photoURL || '',
    bannerURL: profile.bannerURL || '',
    gallery: normalizeGallery(profile.gallery),
    businessAddress: profile.businessAddress || '',
    businessAddressNumber: profile.businessAddressNumber || '',
    businessNeighborhood: profile.businessNeighborhood || '',
    businessState: profile.businessState || '',
    businessComplement: profile.businessComplement || '',
  };
};

export const clearProviderFields = (values: ProfileFormValues): ProfileFormValues => ({
  ...values,
  ...Object.fromEntries(PROVIDER_ONLY_FIELDS.map((field) => [field, ''])),
  availability: [],
});

export const toProfileUpdatePayload = (values: ProfileFormValues): Partial<UserProfile> => {
  const isProvider = values.isProvider;
  const providerValues = isProvider ? values : clearProviderFields(values);

  const baptismYear = normalizeOptionalText(providerValues.baptismYear);

  return {
    name: values.name.trim(),
    bio: normalizeOptionalText(values.bio),
    location: normalizeOptionalText(values.location),
    showPublicLocation: values.showPublicLocation,
    ward: normalizeOptionalText(values.ward),
    isProvider,
    whatsapp: normalizeDigits(values.whatsapp),
    phone: normalizeDigits(values.phone),
    instagram: normalizeOptionalText(values.instagram),
    facebook: normalizeOptionalText(values.facebook),
    linkedin: normalizeOptionalText(values.linkedin),
    website: normalizeOptionalText(values.website),
    photoURL: normalizeOptionalText(values.photoURL),
    bannerURL: normalizeOptionalText(values.bannerURL),
    gallery: normalizeGallery(values.gallery).map((item): GalleryItem => ({
      url: item.url,
      description: normalizeOptionalText(item.description) || '',
    })),
    category: normalizeOptionalText(providerValues.category),
    companyName: normalizeOptionalText(providerValues.companyName),
    serviceType: normalizeOptionalText(providerValues.serviceType),
    availability: isProvider ? normalizeAvailability(providerValues.availability) : [],
    serviceHours: normalizeOptionalText(providerValues.serviceHours),
    businessAddress: normalizeOptionalText(providerValues.businessAddress),
    businessAddressNumber: normalizeOptionalText(providerValues.businessAddressNumber),
    businessNeighborhood: normalizeOptionalText(providerValues.businessNeighborhood),
    businessState: normalizeOptionalText(providerValues.businessState),
    businessComplement: normalizeOptionalText(providerValues.businessComplement),
    baptismYear: baptismYear ? Number.parseInt(baptismYear, 10) : undefined,
  };
};
