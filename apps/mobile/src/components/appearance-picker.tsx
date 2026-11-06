import { Moon, Smartphone, Sun, type LucideIcon } from '@/lib/icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppearance, type AppearancePreference } from '@/lib/appearance';
import { cn } from '@/lib/utils';
import type { MessageKey } from '@skillsy/shared/i18n/keys';
import { useT } from '@/lib/i18n';

const OPTIONS: { value: AppearancePreference; label: MessageKey; icon: LucideIcon }[] = [
  { value: 'light', label: 'app.appearance.light', icon: Sun },
  { value: 'dark', label: 'app.appearance.dark', icon: Moon },
  { value: 'system', label: 'app.appearance.system', icon: Smartphone },
];

/** Aparência: light, dark or the phone's setting, like the site's theme toggle. */
export function AppearancePicker() {
  const { preference, setPreference } = useAppearance();
  const t = useT();
  return (
    <View className="border border-border-subtle bg-card" accessibilityRole="radiogroup">
      <Text className="px-4 pb-1 pt-4 font-heading text-lg font-semibold">{t("app.appearance.title")}</Text>
      {OPTIONS.map(({ value, label, icon: Icon }, index) => {
        const selected = preference === value;
        return (
          <Pressable
            key={value}
            onPress={() => setPreference(value)}
            accessibilityRole="radio"
            aria-checked={selected}
            className={cn(
              'min-h-14 flex-row items-center gap-4 px-4 py-3 active:bg-accent',
              index < OPTIONS.length - 1 && 'border-b border-border-subtle'
            )}>
            <Icon size={20} className={selected ? 'text-primary' : 'text-muted-foreground'} />
            <Text className={cn('flex-1 text-base', selected && 'font-semibold text-primary')}>
              {t(label)}
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
