import { opportunityWhatsappUrl } from '@skillsy/shared/opportunities';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterSelect } from '@/components/filter-select';
import { OpportunityCard, OpportunityCardSkeleton } from '@/components/opportunity-card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/lib/filters';
import { getActiveOpportunities } from '@/lib/opportunities';
import { getOwnProfile } from '@/lib/providers';

export default function OportunidadesScreen() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['opportunities', category, state],
    queryFn: () => getActiveOpportunities({ category, state }),
  });
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });

  // Same rule as the site: only professionals answer, never on their own post.
  const isProvider = Boolean(user && me?.isProvider);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-3 border-b border-border-subtle bg-card px-4 pb-4 pt-2">
        <Text className="text-2xl font-bold text-brand">Oportunidades</Text>
        <View className="flex-row gap-2">
          <FilterSelect
            label="Serviço"
            allLabel="Todos os serviços"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />
          <FilterSelect
            label="Estado"
            allLabel="Todos os estados"
            options={STATE_OPTIONS}
            value={state}
            onChange={setState}
          />
        </View>
      </View>

      {isPending ? (
        <View className="gap-3 p-4">
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
        </View>
      ) : isError ? (
        <View className="items-center gap-3 p-8">
          <Text className="text-center text-muted-foreground">
            Não foi possível carregar as oportunidades. Confira sua conexão.
          </Text>
          <Button variant="outline" onPress={() => refetch()}>
            <Text>Tentar de novo</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(opportunity) => opportunity.id!}
          renderItem={({ item }) => (
            <OpportunityCard
              opportunity={item}
              contactUrl={
                isProvider && me && item.authorId !== user?.uid
                  ? opportunityWhatsappUrl(item, me.name)
                  : null
              }
            />
          )}
          contentContainerClassName="gap-3 p-4"
          onRefresh={refetch}
          refreshing={isRefetching}
          ListHeaderComponent={
            isProvider ? undefined : (
              <Text className="text-sm text-muted-foreground">
                Profissionais com conta no Skillsy respondem às oportunidades pelo WhatsApp.
              </Text>
            )
          }
          ListEmptyComponent={
            <Text className="p-8 text-center text-muted-foreground">
              {category || state
                ? 'Nenhuma oportunidade com esses filtros.'
                : 'Ainda não há oportunidades abertas.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
