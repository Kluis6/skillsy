import { Moon, Smartphone, Sun, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppearance, type AppearancePreference } from '@/lib/appearance';
import { cn } from '@/lib/utils';

const OPTIONS: { value: AppearancePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Automático (igual ao celular)', icon: Smartphone },
];

/** Aparência: light, dark or the phone's setting, like the site's theme toggle. */
export function AppearancePicker() {
  const { preference, setPreference } = useAppearance();
  return (
    <View className="border border-border-subtle bg-card" accessibilityRole="radiogroup">
      <Text className="px-4 pb-1 pt-4 font-heading text-lg font-semibold">Aparência</Text>
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
              {label}
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
