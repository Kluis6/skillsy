import { router } from 'expo-router';
import { ArrowLeft, Bell } from '@/lib/icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { cn } from '@/lib/utils';

type AppHeaderProps = {
  title: string;
  /** Screens opened on top of the tabs get a back arrow. */
  back?: boolean;
  /** Icon buttons on the right (Material 3 top app bar actions). */
  actions?: ReactNode;
  /** Extra rows that belong to the top bar (search field, chips, tabs). */
  children?: ReactNode;
};

/**
 * The one top bar of the app (Material 3 small top app bar in Skillsy's
 * style): same height, title size (Outfit 24), background and border on every
 * screen, tabs or not. The native stack header is off in _layout.
 */
export function AppHeader({ title, back = false, actions, children }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  // The tab screens (no back arrow) end with the notifications bell.
  const bell = !back && user ? <NotificationBell /> : null;
  const goBack = () => (router.canGoBack() ? router.back() : router.navigate('/'));

  return (
    // The title row always ends in a line (same color as the bottom tab bar's);
    // extra rows below it close the header with a second line.
    <View
      style={{ paddingTop: insets.top }}
      className={cn('bg-card', children ? 'border-b border-border' : null)}>
      <View
        className={cn(
          'h-16 flex-row items-center border-b border-border',
          back ? 'pl-1' : 'pl-4',
          actions || bell ? 'pr-1' : 'pr-4'
        )}>
        {back ? (
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="mr-1 size-12 items-center justify-center active:bg-accent">
            <ArrowLeft size={24} className="text-foreground" />
          </Pressable>
        ) : null}
        <Text role="heading" numberOfLines={1} className="flex-1 font-heading text-2xl font-bold">
          {title}
        </Text>
        {actions}
        {bell}
      </View>
      {children}
    </View>
  );
}

/** 48dp icon button for AppHeader actions. */
export function HeaderAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="size-12 items-center justify-center active:bg-accent">
      <Icon size={22} className="text-foreground" />
    </Pressable>
  );
}

/** Bell with the unread count; opens Notificações in the current tab. */
function NotificationBell() {
  const { unread } = useNotifications();
  return (
    <Pressable
      onPress={() => router.push('/notificacoes')}
      accessibilityRole="button"
      accessibilityLabel={unread ? `Notificações, ${unread} não lidas` : 'Notificações'}
      className="size-12 items-center justify-center active:bg-accent">
      <Bell size={22} className="text-foreground" />
      {unread ? (
        <View className="absolute right-2 top-2 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1">
          <Text className="text-[11px] font-bold leading-[14px] text-white">
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
