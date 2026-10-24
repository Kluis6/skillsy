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
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/lib/filters';
import {
  answerFollowUp,
  getActiveOpportunities,
  getMyOpportunities,
  setOpportunityStatus,
} from '@/lib/opportunities';
import { getOwnProfile } from '@/lib/providers';

type Tab = 'mural' | 'minhas';
const TABS = [
  { value: 'mural', label: 'Mural' },
  { value: 'minhas', label: 'Minhas oportunidades' },
] as const;

export default function OportunidadesScreen() {
  const { user } = useAuth();
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
      showSnackbar('Entre na sua conta para publicar uma oportunidade.');
      router.navigate('/perfil');
      return;
    }
    router.push('/oportunidade/nova');
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Oportunidades">
        <TopTabs tabs={TABS} value={tab} onChange={setTab} />
      </AppHeader>
      {tab === 'mural' ? <Mural /> : <Minhas onPublish={publish} />}
      {/* Minhas has its own "Publicar" in the empty state; one call per screen. */}
      {tab === 'mural' ? <Fab icon={Plus} label="Publicar oportunidade" onPress={publish} /> : null}
    </View>
  );
}

function Mural() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [sheet, setSheet] = useState<'category' | 'state' | null>(null);
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
  const stateLabel = STATE_OPTIONS.find((option) => option.value === state)?.label;

  return (
    <>
      <View className="flex-row gap-card border-b border-border bg-card px-4 pb-6 pt-4">
        <Chip
          className="flex-1"
          label={category || 'Serviço'}
          selected={Boolean(category)}
          menu
          onPress={() => setSheet('category')}
          accessibilityLabel={category ? `Serviço: ${category}` : 'Filtrar por serviço'}
        />
        <Chip
          className="flex-1"
          label={stateLabel || 'Estado'}
          selected={Boolean(state)}
          menu
          onPress={() => setSheet('state')}
          accessibilityLabel={stateLabel ? `Estado: ${stateLabel}` : 'Filtrar por estado'}
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
                Profissionais com conta no Skillsy respondem às oportunidades pelo WhatsApp.
              </Text>
            )
          }
          ListEmptyComponent={
            <Text className="p-8 text-center text-muted-foreground">
              {category || state
                ? 'Nenhuma oportunidade com esses filtros.'
                : 'Ainda não há oportunidades abertas. Publique a primeira.'}
            </Text>
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
    </>
  );
}

function Minhas({ onPublish }: { onPublish: () => void }) {
  const { user } = useAuth();
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
          ? 'Oportunidade encerrada. Profissionais não a verão mais.'
          : 'Oportunidade reativada por mais 30 dias.'
      );
    },
    onError: () => showSnackbar('Não foi possível atualizar a oportunidade.'),
  });
  const followUp = useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Parameters<typeof answerFollowUp>[1] }) =>
      answerFollowUp(id, answers),
    onSuccess: (_, { answers }) => {
      refresh();
      showSnackbar(
        answers.closeRequest
          ? 'Obrigado. A oportunidade foi encerrada.'
          : 'Obrigado pelo retorno. A oportunidade continua ativa.'
      );
    },
    onError: () => showSnackbar('Não foi possível registrar sua resposta.'),
  });

  if (!user) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Acompanhe suas oportunidades"
        description="Entre na sua conta para publicar e acompanhar o que você precisa."
        primary={{ label: 'Publicar oportunidade', onPress: onPublish }}
        secondary={{ label: 'Entrar na sua conta', onPress: () => router.navigate('/perfil') }}
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
          title="Você ainda não publicou oportunidades"
          description="Conte o que precisa e os profissionais do mesmo serviço e estado são avisados."
          primary={{ label: 'Publicar oportunidade', onPress: onPublish }}
        />
      }
    />
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="items-center gap-3 p-8">
      <Text className="text-center text-muted-foreground">
        Não foi possível carregar as oportunidades. Confira sua conexão.
      </Text>
      <Button variant="outline" onPress={onRetry}>
        <Text>Tentar de novo</Text>
      </Button>
    </View>
  );
}
