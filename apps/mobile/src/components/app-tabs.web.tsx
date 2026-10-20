import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { BookUser, BriefcaseBusiness, Search, User, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Browser preview of the Android bottom navigation (app-tabs.tsx).
export default function AppTabs() {
  return (
    <Tabs className="flex-1 bg-background">
      <TabSlot />
      <TabList asChild>
        <View className="flex-row border-t border-border bg-card">
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={Search} label="Buscar" />
          </TabTrigger>
          <TabTrigger name="oportunidades" href="/oportunidades" asChild>
            <TabButton icon={BriefcaseBusiness} label="Oportunidades" />
          </TabTrigger>
          <TabTrigger name="contatos" href="/contatos" asChild>
            <TabButton icon={BookUser} label="Contatos" />
          </TabTrigger>
          <TabTrigger name="perfil" href="/perfil" asChild>
            <TabButton icon={User} label="Perfil" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

// `ref` is left out of the type: expo-router/ui types it for the old View class, but
// asChild still passes it through the spread at runtime.
type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> & { icon: LucideIcon; label: string };

function TabButton({ icon: Icon, label, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={{ flex: 1 }}>
      <View className="items-center gap-1 py-2">
        <View className={cn('px-5 py-1', isFocused && 'rounded-full bg-accent')}>
          <Icon size={22} className={isFocused ? 'text-primary' : 'text-muted-foreground'} />
        </View>
        <Text
          className={cn(
            'text-xs',
            isFocused ? 'font-semibold text-primary' : 'text-muted-foreground'
          )}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
