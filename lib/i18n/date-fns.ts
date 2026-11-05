import { enUS, es, ptBR } from 'date-fns/locale';
import type { Locale } from '@skillsy/shared/i18n/locales';

/** date-fns locale for each language (relative dates like "há 3 dias"). */
export const DATE_FNS_LOCALE = { pt: ptBR, en: enUS, es } satisfies Record<Locale, unknown>;
