import type { UserProfile } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ProviderCard, ProviderCardSkeleton } from '@/components/provider-card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { getContacts } from '@/lib/contacts';
import { getOwnProfile } from '@/lib/providers';

/** Meus contatos: the professionals the member connected with ("Conectar"). */
export default function ContatosScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  const uids = me?.contacts ?? [];
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['contacts', user?.uid, uids],
    queryFn: () => getContacts(uids),
    enabled: Boolean(user && me),
  });

  const openProfile = (provider: UserProfile) => {
    queryClient.setQueryData(['profile', provider.uid], provider);
    router.push({ pathname: '/profissional/[id]', params: { id: provider.uid } });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title="Meus contatos" back />
      {!user ? (
        <View className="items-center gap-3 p-8">
          <Text className="text-center text-muted-foreground">
            Entre na sua conta para guardar os profissionais com quem você se conectou.
          </Text>
          <Button variant="outline" onPress={() => router.navigate('/perfil')}>
            <Text>Entrar</Text>
          </Button>
        </View>
      ) : isPending ? (
        <View className="gap-card p-4">
          <ProviderCardSkeleton />
          <ProviderCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(provider) => provider.uid}
          renderItem={({ item }) => (
            <ProviderCard provider={item} onPress={() => openProfile(item)} />
          )}
          contentContainerClassName="gap-card p-4"
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['me', user.uid] });
            refetch();
          }}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View className="items-center gap-3 py-8">
              <Text className="text-center text-muted-foreground">
                Nenhum contato ainda. Toque em Conectar no perfil de um profissional para guardá-lo
                aqui.
              </Text>
              <Button variant="outline" onPress={() => router.navigate('/buscar')}>
                <Text>Buscar profissionais</Text>
              </Button>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
