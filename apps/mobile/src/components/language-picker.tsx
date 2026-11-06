import { LOCALE_NAMES } from '@skillsy/shared/i18n/locales';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ENABLED_LOCALES, useLocale, useT } from '@/lib/i18n';
import { Languages } from '@/lib/icons';
import { cn } from '@/lib/utils';

/** Idioma, next to Aparência in Perfil: saved on the phone and, signed in,
 * on the account. Hidden while only Portuguese is on. */
export function LanguagePicker() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  if (ENABLED_LOCALES.length < 2) return null;

  return (
    <View className="border border-border-subtle bg-card" accessibilityRole="radiogroup">
      <Text className="px-4 pb-1 pt-4 font-heading text-lg font-semibold">{t('language.label')}</Text>
      {ENABLED_LOCALES.map((value, index) => {
        const selected = locale === value;
        return (
          <Pressable
            key={value}
            onPress={() => setLocale(value)}
            accessibilityRole="radio"
            aria-checked={selected}
            className={cn(
              'min-h-14 flex-row items-center gap-4 px-4 py-3 active:bg-accent',
              index < ENABLED_LOCALES.length - 1 && 'border-b border-border-subtle'
            )}>
            <Languages size={20} className={selected ? 'text-primary' : 'text-muted-foreground'} />
            <Text
              lang={value}
              className={cn('flex-1 text-base', selected && 'font-semibold text-primary')}>
              {LOCALE_NAMES[value]}
            </Text>
            <View
              className={cn(
                'size-5 items-center justify-center rounded-full border-2',
                selected ? 'border-primary' : 'border-muted-foreground'
              )}>
              {selected ? <View className="size-2.5 rounded-full bg-primary" /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
