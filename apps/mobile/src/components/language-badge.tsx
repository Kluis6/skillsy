import { contentLanguage } from '@skillsy/shared/i18n/origin';
import type { MessageKey } from '@skillsy/shared/i18n/keys';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { useLocale, useT } from '@/lib/i18n';

/** The language a profile, post or opportunity is written in, only when it
 * differs from the app's language ("PT" in English). Same as the site's. */
export function LanguageBadge({ item }: { item: { language?: string | null } }) {
  const t = useT();
  const { locale } = useLocale();
  const language = contentLanguage(item);
  if (language === locale) return null;
  const label = t('language.writtenIn', { language: t(`language.names.${language}` as MessageKey) });

  return (
    <Badge variant="outline" className="px-1.5" accessibilityLabel={label}>
      <Text className="text-[10px] font-bold uppercase tracking-wide">{language}</Text>
    </Badge>
  );
}
