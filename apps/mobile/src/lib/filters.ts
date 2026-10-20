import { BRAZIL_STATES } from '@skillsy/shared/brazil-states';
import { PROVIDER_CATEGORIES } from '@skillsy/shared/profile-options';

export const CATEGORY_OPTIONS = PROVIDER_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

export const STATE_OPTIONS = BRAZIL_STATES.filter((state) => state.value !== 'all');
