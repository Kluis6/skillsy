import { opportunityWhatsappUrl } from '@skillsy/shared/opportunities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { BriefcaseBusiness, Plus } from '@/lib/icons';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { Fab } from '@/components/fab';
import { MyOpportunityCard } from '@/components/my-opportunity-card';
import { OpportunityCard, OpportunityCardSkeleton } from '@/components/opportunity-card';
import { OptionSheet } from '@/components/option-sheet';
import { useSnackbar } from '@/components/snackbar';
import { TopTabs } from '@/components/top-tabs';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { STATE_OPTIONS, useCategoryOptions } from '@/lib/filters';
import { byOrigin } from '@skillsy/shared/i18n/origin';
import {
  answerFollowUp,
  getActiveOpportunities,
  getMyOpportunities,
  setOpportunityStatus,
} from '@/lib/opportunities';
import { getOwnProfile } from '@/lib/providers';
import { useLabels, useLocale, useT } from '@/lib/i18n';

type Tab = 'mural' | 'minhas';
const TABS = [
  { value: 'mural', label: 'app.opportunities.board' },
  { value: 'minhas', label: 'app.opportunities.mine' },
] as const;

export default function OportunidadesScreen() {
  const { user } = useAuth();
  const t = useT();
  const showSnackbar = useSnackbar();
  // A tapped notification links here with ?tab=, also when the screen is
  // already open, so the tab follows the link whenever it changes.
  const { tab: linkedTab } = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(linkedTab === 'minhas' ? 'minhas' : 'mural');
  const [lastLinkedTab, setLastLinkedTab] = useState(linkedTab);
  if (linkedTab !== lastLinkedTab) {
    setLastLinkedTab(linkedTab);
    if (linkedTab === 'minhas' || linkedTab === 'mural') setTab(linkedTab);
  }

  const publish = () => {
    if (!user) {
      showSnackbar(t("app.opportunities.signInToPublish"));
      router.navigate('/perfil');
      return;
    }
    router.push('/oportunidade/nova');
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={t("app.opportunities.title")}>
        <TopTabs
          tabs={TABS.map((item) => ({ value: item.value, label: t(item.label) }))}
          value={tab}
          onChange={setTab}
        />
      </AppHeader>
      {tab === 'mural' ? <Mural /> : <Minhas onPublish={publish} />}
      {/* Minhas has its own "Publicar" in the empty state; one call per screen. */}
      {tab === 'mural' ? <Fab icon={Plus} label={t("app.opportunities.publish")} onPress={publish} /> : null}
    </View>
  );
}

function Mural() {
  const { user } = useAuth();
  const t = useT();
  const labels = useLabels();
  const { locale } = useLocale();
  const categoryOptions = useCategoryOptions();
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [sheet, setSheet] = useState<'category' | 'state' | null>(null);
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['opportunities', category, state, locale],
    // The visitor's country only, in the app's language first.
    queryFn: async () => byOrigin(await getActiveOpportunities({ category, state }), { language: locale }),
  });
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  // Same rule as the site: only professionals answer, never on their own post.
  const isProvider = Boolean(user && me?.isProvider);
  const stateLabel = STATE_OPTIONS.find((option) => option.value === state)?.label;

  return (
    <>
      <View className="flex-row gap-card border-b border-border bg-card px-4 pb-6 pt-4">
        <Chip
          className="h-12 flex-1"
          label={category ? labels.category(category) : t("app.opportunities.service")}
          selected={Boolean(category)}
          menu
          onPress={() => setSheet('category')}
          accessibilityLabel={category ? t("app.opportunities.serviceAria", { value: labels.category(category) }) : t("app.opportunities.filterByService")}
        />
        <Chip
          className="h-12 flex-1"
          label={stateLabel || t("app.opportunities.state")}
          selected={Boolean(state)}
          menu
          onPress={() => setSheet('state')}
          accessibilityLabel={stateLabel ? t("app.opportunities.stateAria", { value: stateLabel }) : t("app.opportunities.filterByState")}
        />
      </View>

      {isPending ? (
        <View className="gap-card p-4">
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
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
          // Room for the FAB over the last card.
          contentContainerClassName="gap-card p-4 pb-24"
          onRefresh={refetch}
          refreshing={isRefetching}
          ListHeaderComponent={
            isProvider ? undefined : (
              <Text className="text-sm text-muted-foreground">
                {t("app.opportunities.providersAnswer")}
              </Text>
            )
          }
          ListEmptyComponent={
            <Text className="p-8 text-center text-muted-foreground">
              {category || state
                ? t("app.opportunities.emptyFiltered")
                : t("app.opportunities.empty")}
            </Text>
          }
        />
      )}

      <OptionSheet
        visible={sheet === 'category'}
        title={t("app.opportunities.service")}
        options={categoryOptions}
        value={category}
        allLabel={t("app.opportunities.allServices")}
        onSelect={setCategory}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'state'}
        title={t("app.opportunities.state")}
        options={STATE_OPTIONS}
        value={state}
        allLabel={t("app.opportunities.allStates")}
        onSelect={setState}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

function Minhas({ onPublish }: { onPublish: () => void }) {
  const { user } = useAuth();
  const t = useT();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['my-opportunities', user?.uid],
    queryFn: () => getMyOpportunities(user!.uid),
    enabled: Boolean(user),
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['my-opportunities'] });
    queryClient.invalidateQueries({ queryKey: ['opportunities'] });
  };
  const status = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'active' | 'closed' }) =>
      setOpportunityStatus(id, next),
    onSuccess: (_, { next }) => {
      refresh();
      showSnackbar(
        next === 'closed'
          ? t("app.opportunities.closed")
          : t("app.opportunities.reopened")
      );
    },
    onError: () => showSnackbar(t("app.opportunities.updateError")),
  });
  const followUp = useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Parameters<typeof answerFollowUp>[1] }) =>
      answerFollowUp(id, answers),
    onSuccess: (_, { answers }) => {
      refresh();
      showSnackbar(
        answers.closeRequest
          ? t("app.opportunities.followUpClosed")
          : t("app.opportunities.followUpKept")
      );
    },
    onError: () => showSnackbar(t("app.opportunities.followUpError")),
  });

  if (!user) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title={t("app.opportunities.followTitle")}
        description={t("app.opportunities.followText")}
        primary={{ label: t("app.opportunities.publish"), onPress: onPublish }}
        secondary={{ label: t("app.opportunities.signIn"), onPress: () => router.navigate('/perfil') }}
      />
    );
  }
  if (isPending) {
    return (
      <View className="gap-card p-4">
        <OpportunityCardSkeleton />
      </View>
    );
  }
  if (isError) return <ErrorState onRetry={refetch} />;

  const busy = status.isPending || followUp.isPending;
  return (
    <FlatList
      data={data}
      keyExtractor={(opportunity) => opportunity.id!}
      renderItem={({ item }) => (
        <MyOpportunityCard
          opportunity={item}
          busy={busy}
          onStatus={(next) => status.mutate({ id: item.id!, next })}
          onFollowUp={(answers) => followUp.mutate({ id: item.id!, answers })}
        />
      )}
      contentContainerClassName="gap-card p-4 pb-24"
      onRefresh={refetch}
      refreshing={isRefetching}
      contentContainerStyle={data?.length ? undefined : { flexGrow: 1 }}
      ListEmptyComponent={
        <EmptyState
          icon={BriefcaseBusiness}
          title={t("app.opportunities.mineEmpty")}
          description={t("app.opportunities.mineEmptyText")}
          primary={{ label: t("app.opportunities.publish"), onPress: onPublish }}
        />
      }
    />
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <View className="items-center gap-3 p-8">
      <Text className="text-center text-muted-foreground">
        {t("app.opportunities.loadError")}
      </Text>
      <Button variant="outline" onPress={onRetry}>
        <Text>{t("app.opportunities.retry")}</Text>
      </Button>
    </View>
  );
}
