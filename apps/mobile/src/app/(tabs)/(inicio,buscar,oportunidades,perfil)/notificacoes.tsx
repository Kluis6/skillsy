import { formatFirestoreDate } from '@skillsy/shared/opportunities';
import type { UserNotification } from '@skillsy/shared/types';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, HeaderAction } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { Bell, BriefcaseBusiness, CheckCheck, Clock, Newspaper } from '@/lib/icons';
import {
  markAllNotificationsRead,
  markNotificationRead,
  notificationRoute,
  useNotifications,
} from '@/lib/notifications';
import { cn } from '@/lib/utils';

const ICONS = {
  opportunity_match: BriefcaseBusiness,
  opportunity_follow_up: Clock,
  post_published: Newspaper,
};

/** Alerts for new opportunities, the 20-day reminder and new articles/jobs. */
export default function NotificacoesScreen() {
  const { user } = useAuth();
  const { items, unread } = useNotifications();

  const open = (item: UserNotification) => {
    if (user && !item.read) markNotificationRead(user.uid, item.id).catch(() => {});
    router.push(notificationRoute(item.type, item.postSlug));
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader
        title="Notificações"
        back
        actions={
          user && unread ? (
            <HeaderAction
              icon={CheckCheck}
              label="Marcar todas como lidas"
              onPress={() => markAllNotificationsRead(user.uid, items).catch(() => {})}
            />
          ) : null
        }
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerClassName="grow"
        renderItem={({ item }) => {
          const Icon = ICONS[item.type] ?? Bell;
          return (
            <Pressable
              onPress={() => open(item)}
              accessibilityRole="link"
              className={cn(
                'flex-row gap-3 border-b border-border-subtle p-4 active:bg-accent',
                !item.read && 'bg-primary/5'
              )}>
              <View className="size-10 items-center justify-center bg-primary/10">
                <Icon size={20} className="text-primary" />
              </View>
              <View className="flex-1 gap-1">
                <Text className={cn('font-semibold', item.read && 'text-muted-foreground')}>
                  {item.title}
                </Text>
                <Text className="text-sm text-muted-foreground" numberOfLines={3}>
                  {item.message}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {formatFirestoreDate(item.createdAt)}
                </Text>
              </View>
              {!item.read ? (
                <View
                  accessibilityLabel="Não lida"
                  className="mt-1.5 size-2 rounded-full bg-primary"
                />
              ) : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação"
            description="Avisamos aqui quando houver oportunidades para você e novos artigos e vagas."
          />
        }
      />
    </SafeAreaView>
  );
}
