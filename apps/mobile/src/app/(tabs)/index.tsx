import type { UserProfile } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterSelect } from '@/components/filter-select';
import { ProviderCard, ProviderCardSkeleton } from '@/components/provider-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/lib/filters';
import { searchProviders } from '@/lib/providers';

export default function BuscarScreen() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['providers', term, category, state],
    queryFn: () => searchProviders({ term, category, state }),
  });

  const submit = () => setTerm(draft.trim());
  const filtered = Boolean(term || category || state);

  const openProfile = (provider: UserProfile) => {
    // The list already has the public profile: no extra read to open it.
    queryClient.setQueryData(['profile', provider.uid], provider);
    router.push({ pathname: '/profissional/[id]', params: { id: provider.uid } });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-3 border-b border-border-subtle bg-card px-4 pb-4 pt-2">
        <Text className="text-2xl font-bold text-brand">Skillsy</Text>
        <View className="flex-row gap-2">
          <Input
            className="flex-1"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            placeholder="Serviço ou profissional (ex.: eletricista)"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Buscar profissionais"
          />
          <Button size="icon" onPress={submit} accessibilityLabel="Buscar">
            <Search size={18} className="text-primary-foreground" />
          </Button>
        </View>
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
          <ProviderCardSkeleton />
          <ProviderCardSkeleton />
          <ProviderCardSkeleton />
        </View>
      ) : isError ? (
        <View className="items-center gap-3 p-8">
          <Text className="text-center text-muted-foreground">
            Não foi possível carregar os profissionais. Confira sua conexão.
          </Text>
          <Button variant="outline" onPress={() => refetch()}>
            <Text>Tentar de novo</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(provider) => provider.uid}
          renderItem={({ item }) => <ProviderCard provider={item} onPress={() => openProfile(item)} />}
          contentContainerClassName="gap-3 p-4"
          onRefresh={refetch}
          refreshing={isRefetching}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text className="text-sm text-muted-foreground">
              {filtered
                ? `${data.length} ${data.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`
                : 'Profissionais da comunidade'}
            </Text>
          }
          ListEmptyComponent={
            <Text className="p-8 text-center text-muted-foreground">
              Nenhum profissional encontrado. Tente um termo mais genérico ou outro filtro.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
