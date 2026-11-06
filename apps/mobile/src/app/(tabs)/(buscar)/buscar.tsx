import { PROVIDER_CATEGORIES } from '@skillsy/shared/profile-options';
import type { UserProfile } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, X } from '@/lib/icons';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Chip } from '@/components/chip';
import { CategoryGridCard } from '@/components/home/category-tile';
import { SectionHeader } from '@/components/home/section-header';
import { ServiceCard } from '@/components/home/service-card';
import { OptionSheet } from '@/components/option-sheet';
import { ProviderCard, ProviderCardSkeleton } from '@/components/provider-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { categoryIcon } from '@/lib/category-icons';
import { STATE_OPTIONS, useCategoryOptions } from '@/lib/filters';
import { searchProviders } from '@/lib/providers';
import { RECOMMENDED_SERVICES } from '@/lib/service-catalog';
import { buildSearchSynonyms } from '@skillsy/shared/i18n/search-synonyms';
import { useLabels, useLocale, useT } from '@/lib/i18n';

type Params = { q?: string; categoria?: string; estado?: string; focar?: string };

export default function BuscarScreen() {
  const queryClient = useQueryClient();
  const t = useT();
  const labels = useLabels();
  const { locale } = useLocale();
  const categoryOptions = useCategoryOptions();
  // Search and filters live in the route params, so Início can open this
  // screen already filled in and Android's back button undoes a search.
  const params = useLocalSearchParams<Params>();
  const term = params.q ?? '';
  const category = params.categoria ?? '';
  const state = params.estado ?? '';
  const filtered = Boolean(term || category || state);
  const [sheet, setSheet] = useState<'category' | 'state' | null>(null);

  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['providers', term, category, state, locale],
    queryFn: () =>
      searchProviders({
        term,
        category,
        state,
        synonyms: buildSearchSynonyms(locale, labels.category),
        language: locale,
      }),
    enabled: filtered,
  });

  const setFilters = (patch: Partial<Params>) => router.setParams({ focar: '', ...patch });
  const clearAll = () => router.setParams({ q: '', categoria: '', estado: '', focar: '' });
  const stateLabel = STATE_OPTIONS.find((option) => option.value === state)?.label;
  const openProfile = (provider: UserProfile) => {
    // The list already has the public profile: no extra read to open it.
    queryClient.setQueryData(['profile', provider.uid], provider);
    router.push({ pathname: '/profissional/[id]', params: { id: provider.uid } });
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={t("app.search.title")}>
        <View className="gap-5 pb-6 pt-4">
          <SearchField
            key={term}
            initial={term}
            autoFocus={params.focar === '1'}
            onSubmit={(q) => setFilters({ q })}
          />
          {/* Serviço and Estado split the width; "Limpar" takes only what it needs. */}
          <View className="flex-row gap-card px-4">
            <Chip
              className="h-12 flex-1"
              label={category ? labels.category(category) : t("app.search.service")}
              selected={Boolean(category)}
              menu
              onPress={() => setSheet('category')}
              accessibilityLabel={category ? t("app.search.serviceAria", { value: labels.category(category) }) : t("app.search.filterByService")}
            />
            <Chip
              className="h-12 flex-1"
              label={stateLabel || t("app.search.state")}
              selected={Boolean(state)}
              menu
              onPress={() => setSheet('state')}
              accessibilityLabel={stateLabel ? t("app.search.stateAria", { value: stateLabel }) : t("app.search.filterByState")}
            />
            {filtered ? <Chip className="h-12" label={t("app.search.clear")} onPress={clearAll} /> : null}
          </View>
        </View>
      </AppHeader>

      {!filtered ? (
        <Discover onSearch={(q) => setFilters({ q })} />
      ) : isError ? (
        <View className="items-center gap-3 p-8">
          <Text className="text-center text-muted-foreground">
            {t("app.search.loadError")}
          </Text>
          <Button variant="outline" onPress={() => refetch()}>
            <Text>{t("app.search.retry")}</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={isPending ? [] : data}
          keyExtractor={(provider) => provider.uid}
          renderItem={({ item }) => (
            <ProviderCard provider={item} onPress={() => openProfile(item)} />
          )}
          contentContainerClassName="gap-card p-4"
          onRefresh={refetch}
          refreshing={isRefetching}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text className="font-heading text-lg font-semibold">
              {isPending
                ? t("app.search.searching")
                : t("app.search.found", { count: data?.length ?? 0 })}
            </Text>
          }
          ListEmptyComponent={
            isPending ? (
              <View className="gap-card">
                <ProviderCardSkeleton />
                <ProviderCardSkeleton />
              </View>
            ) : (
              <View className="items-center gap-3 py-8">
                <Text className="text-center text-muted-foreground">
                  {t("app.search.empty")}
                </Text>
                <Button variant="outline" onPress={() => router.push('/oportunidade/nova')}>
                  <Text>{t("app.search.publish")}</Text>
                </Button>
              </View>
            )
          }
        />
      )}

      <OptionSheet
        visible={sheet === 'category'}
        title={t("app.search.service")}
        options={categoryOptions}
        value={category}
        allLabel={t("app.search.allServices")}
        onSelect={(categoria) => setFilters({ categoria })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'state'}
        title={t("app.search.state")}
        options={STATE_OPTIONS}
        value={state}
        allLabel={t("app.search.allStates")}
        onSelect={(estado) => setFilters({ estado })}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

function SearchField({
  initial,
  autoFocus,
  onSubmit,
}: {
  initial: string;
  autoFocus: boolean;
  onSubmit: (q: string) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState(initial);
  return (
    <View className="justify-center px-4">
      <Input
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => onSubmit(draft.trim())}
        placeholder={t("app.search.placeholder")}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        className="h-12 px-11"
        accessibilityLabel={t("app.search.searchAria")}
      />
      <Search size={20} className="absolute left-[29px] text-muted-foreground" />
      {draft ? (
        <Pressable
          onPress={() => {
            setDraft('');
            onSubmit('');
          }}
          className="absolute right-4 size-12 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={t("app.search.clearSearch")}>
          <X size={18} className="text-muted-foreground" />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Before searching: recommended services with photos and every category,
 * like GetNinjas' Buscar ("Recomendados" + "Todas categorias"). */
function Discover({ onSearch }: { onSearch: (q: string) => void }) {
  const t = useT();
  const labels = useLabels();
  const rows: string[][] = [];
  for (let i = 0; i < PROVIDER_CATEGORIES.length; i += 2) {
    rows.push(PROVIDER_CATEGORIES.slice(i, i + 2));
  }
  return (
    <ScrollView contentContainerClassName="gap-4 py-5" keyboardShouldPersistTaps="handled">
      <SectionHeader title={t("app.search.recommended")} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-card px-4">
        {RECOMMENDED_SERVICES.map((service) => (
          <ServiceCard
            key={service.title}
            title={t(service.title)}
            image={service.image}
            onPress={() => onSearch(service.search)}
          />
        ))}
      </ScrollView>
      <View className="pt-2">
        <SectionHeader title={t("app.search.allCategories")} />
      </View>
      <View className="gap-card px-4">
        {rows.map((row) => (
          <View key={row[0]} className="flex-row gap-card">
            {/* Equal columns without padding, so a lone last card keeps the
                width of the others. */}
            {row.map((category) => (
              <View key={category} className="flex-1">
                <CategoryGridCard
                  label={labels.category(category)}
                  icon={categoryIcon(category)}
                  onPress={() => onSearch(labels.category(category))}
                />
              </View>
            ))}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
