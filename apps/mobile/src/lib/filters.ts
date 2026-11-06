import { BRAZIL_STATES } from '@skillsy/shared/brazil-states';
import { PROVIDER_CATEGORIES } from '@skillsy/shared/profile-options';
import { useMemo } from 'react';

import { useLabels } from './i18n';

/** Categories for the filter and form sheets: the value saved in Portuguese,
 * the label in the app's language. */
export function useCategoryOptions() {
  const labels = useLabels();
  return useMemo(
    () => PROVIDER_CATEGORIES.map((category) => ({ value: category, label: labels.category(category) })),
    [labels]
  );
}

export const STATE_OPTIONS = BRAZIL_STATES.filter((state) => state.value !== 'all');
