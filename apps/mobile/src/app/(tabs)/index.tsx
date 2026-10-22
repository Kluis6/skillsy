import type { UserProfile } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { LayoutGrid, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { OptionSheet } from '@/components/option-sheet';
import { ProviderCard, ProviderCardSkeleton } from '@/components/provider-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { categoryIcon, POPULAR_CATEGORIES } from '@/lib/category-icons';
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/lib/filters';
import { searchProviders } from '@/lib/providers';

type OpenSheet = 'category' | 'state' | null;

export default function BuscarScreen() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['providers', term, category, state],
    queryFn: () => searchProviders({ term, category, state }),
  });

  const filtered = Boolean(term || category || state);
  const stateLabel = STATE_OPTIONS.find((option) => option.value === state)?.label;

  const submit = () => setTerm(draft.trim());
  const clearSearch = () => {
    setDraft('');
    setTerm('');
  };
  const clearAll = () => {
    clearSearch();
    setCategory('');
    setState('');
  };
  // Shortcuts search by name instead of filtering by category: many
  // professionals pick "Outros" and describe the trade only in the profession
  // or company name, which the search tokens cover.
  const searchService = (service: string) => {
    setDraft(service);
    setTerm(service);
  };
  const openProfile = (provider: UserProfile) => {
    // The list already has the public profile: no extra read to open it.
    queryClient.setQueryData(['profile', provider.uid], provider);
    router.push({ pathname: '/profissional/[id]', params: { id: provider.uid } });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-3 border-b border-border-subtle bg-card pb-3 pt-2">
        <Text className="px-4 font-heading text-2xl font-bold text-brand">Skillsy</Text>

        <View className="justify-center px-4">
          <Input
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            placeholder="O que você procura? Pintor, eletricista…"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            className="px-11"
            accessibilityLabel="Buscar profissionais"
          />
          <Search size={20} className="absolute left-7 text-muted-foreground" />
          {draft ? (
            <Pressable
              onPress={clearSearch}
              className="absolute right-4 size-12 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Limpar busca">
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4">
          <Chip
            label={category || 'Serviço'}
            selected={Boolean(category)}
            menu
            onPress={() => setSheet('category')}
            accessibilityLabel={category ? `Serviço: ${category}` : 'Filtrar por serviço'}
          />
          <Chip
            label={stateLabel || 'Estado'}
            selected={Boolean(state)}
            menu
            onPress={() => setSheet('state')}
            accessibilityLabel={stateLabel ? `Estado: ${stateLabel}` : 'Filtrar por estado'}
          />
          {filtered ? <Chip label="Limpar" onPress={clearAll} /> : null}
        </ScrollView>
      </View>

      {isError ? (
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
          data={isPending ? [] : data}
          keyExtractor={(provider) => provider.uid}
          renderItem={({ item }) => (
            <ProviderCard provider={item} onPress={() => openProfile(item)} />
          )}
          contentContainerClassName="gap-3 p-4"
          onRefresh={refetch}
          refreshing={isRefetching}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View className="gap-4">
              {filtered ? null : (
                <PopularServices
                  onSelect={searchService}
                  onShowAll={() => setSheet('category')}
                />
              )}
              <Text className="font-heading text-lg font-semibold">
                {!filtered
                  ? 'Profissionais da comunidade'
                  : isPending
                    ? 'Buscando…'
                    : `${data?.length ?? 0} ${data?.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            isPending ? (
              <View className="gap-3">
                <ProviderCardSkeleton />
                <ProviderCardSkeleton />
              </View>
            ) : (
              <View className="items-center gap-3 py-8">
                <Text className="text-center text-muted-foreground">
                  Nenhum profissional encontrado. Tente um termo mais genérico ou outro filtro.
                </Text>
                <Button variant="outline" onPress={clearAll}>
                  <Text>Limpar filtros</Text>
                </Button>
              </View>
            )
          }
        />
      )}

      <OptionSheet
        visible={sheet === 'category'}
        title="Serviço"
        options={CATEGORY_OPTIONS}
        value={category}
        allLabel="Todos os serviços"
        onSelect={setCategory}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'state'}
        title="Estado"
        options={STATE_OPTIONS}
        value={state}
        allLabel="Todos os estados"
        onSelect={setState}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
}

function PopularServices({
  onSelect,
  onShowAll,
}: {
  onSelect: (category: string) => void;
  onShowAll: () => void;
}) {
  return (
    <View className="gap-3">
      <Text className="font-heading text-lg font-semibold">Serviços mais procurados</Text>
      <View className="flex-row flex-wrap">
        {POPULAR_CATEGORIES.map((category) => (
          <ServiceTile
            key={category}
            label={category}
            icon={categoryIcon(category)}
            onPress={() => onSelect(category)}
          />
        ))}
        <ServiceTile label="Ver todos" icon={LayoutGrid} onPress={onShowAll} />
      </View>
    </View>
  );
}

function ServiceTile({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: ReturnType<typeof categoryIcon>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-1/4 items-center gap-1.5 py-2 active:bg-accent">
      <View className="size-14 items-center justify-center bg-primary/10">
        <Icon size={24} className="text-primary" />
      </View>
      <Text className="text-center text-xs font-medium" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
