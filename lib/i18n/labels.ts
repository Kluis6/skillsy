'use client';

import { useMemo } from 'react';
import { CATEGORY_LABEL_KEYS, DAY_LABEL_KEYS } from '@skillsy/shared/i18n/labels';
import type { MessageKey } from '@skillsy/shared/i18n/keys';
import { useT } from './provider';

/**
 * Labels for values saved in Portuguese (categories, service days, report
 * reasons). The saved value stays the key; only what is shown changes.
 * Unknown values (old data) are shown as saved.
 */
export function useLabels() {
  const t = useT();
  return useMemo(() => {
    const label = (key: string | undefined, value: string) =>
      key ? t(key as MessageKey) : value;
    return {
      category: (value?: string | null) =>
        value ? label(CATEGORY_LABEL_KEYS[value] && `labels.category.${CATEGORY_LABEL_KEYS[value]}`, value) : '',
      day: (value: string) => label(DAY_LABEL_KEYS[value] && `labels.day.${DAY_LABEL_KEYS[value]}`, value),
      reason: (value: string) => t(`labels.reason.${value}` as MessageKey),
    };
  }, [t]);
}
