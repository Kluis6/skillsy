import { whatsappUrl } from '@skillsy/shared/contact';
import {
  formatRating,
  formatRecommendationCount,
  formatReviewCount,
  providerRoleLabel,
} from '@skillsy/shared/format';
import { formatFirestoreDate } from '@skillsy/shared/opportunities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReportReason } from '@skillsy/shared/reporting';
import {
  Clock,
  Flag,
  MapPin,
  Pencil,
  Share2,
  Star,
  ThumbsUp,
  UserMinus,
  UserPlus,
} from '@/lib/icons';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ActionButton } from '@/components/action-button';
import { RatingSheet } from '@/components/rating-sheet';
import { ProfileAvatar } from '@/components/profile-avatar';
import { ReportSheet } from '@/components/report-sheet';
import { useSnackbar } from '@/components/snackbar';
import { Stars } from '@/components/stars';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { useAuth } from '@/lib/auth';
import { setContact } from '@/lib/contacts';
import { getOwnProfile, getPublicProfile } from '@/lib/providers';
import {
  getRatings,
  getRecommendations,
  hasRecommended,
  submitRating,
  toggleRecommendation,
} from '@/lib/reviews';
import { submitProfileReport } from '@/lib/reports';
import { SITE_URL } from '@/lib/site';

export default function ProfissionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const [ratingOpen, setRatingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { data: provider, isPending } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getPublicProfile(id),
  });
  const { data: ratings } = useQuery({
    queryKey: ['ratings', id],
    queryFn: () => getRatings(id),
    enabled: Boolean(provider),
  });
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => getRecommendations(id),
    enabled: Boolean(provider),
  });
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  const { data: recommended } = useQuery({
    queryKey: ['recommended', id, user?.uid],
    queryFn: () => hasRecommended(id, user!.uid),
    enabled: Boolean(user && provider),
  });

  // Counters on the cached profile change right away; the lists reload.
  const refreshProfile = (patch: (current: typeof provider) => typeof provider) => {
    queryClient.setQueryData(['profile', id], patch);
    queryClient.invalidateQueries({ queryKey: ['providers'] });
  };
  const recommend = useMutation({
    mutationFn: () =>
      toggleRecommendation(user!.uid, id, {
        name: me?.name || user?.displayName || '',
        photoURL: me?.photoURL || '',
      }),
    onSuccess: (added) => {
      queryClient.setQueryData(['recommended', id, user?.uid], added);
      refreshProfile((current) =>
        current
          ? {
              ...current,
              recommendationCount: Math.max(
                0,
                (current.recommendationCount || 0) + (added ? 1 : -1)
              ),
            }
          : current
      );
      queryClient.invalidateQueries({ queryKey: ['recommendations', id] });
      showSnackbar(added ? 'Indicação registrada. Obrigado!' : 'Indicação removida.');
    },
    onError: (error) =>
      showSnackbar(
        error instanceof Error ? error.message : 'Não foi possível registrar a indicação.'
      ),
  });
  const connected = Boolean(me?.contacts?.includes(id));
  const connect = useMutation({
    mutationFn: (next: boolean) => setContact(user!.uid, id, next),
    onSuccess: (_, next) => {
      queryClient.setQueryData(['me', user?.uid], (current: typeof me) =>
        current
          ? {
              ...current,
              contacts: next
                ? [...(current.contacts || []), id]
                : (current.contacts || []).filter((contact) => contact !== id),
            }
          : current
      );
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showSnackbar(next ? 'Adicionado aos contatos.' : 'Removido dos contatos.');
    },
    onError: () => showSnackbar('Não foi possível atualizar seus contatos.'),
  });
  const rate = useMutation({
    mutationFn: ({ score, comment }: { score: number; comment: string }) =>
      submitRating(user!.uid, id, score, comment),
    onSuccess: (_, { score }) => {
      setRatingOpen(false);
      refreshProfile((current) => {
        if (!current) return current;
        const reviewCount = (current.reviewCount || 0) + 1;
        const ratingSum = (current.ratingSum || 0) + score;
        return {
          ...current,
          reviewCount,
          ratingSum,
          rating: Math.round((ratingSum / reviewCount) * 10) / 10,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['ratings', id] });
      showSnackbar('Avaliação enviada. Obrigado!');
    },
  });

  const report = useMutation({
    mutationFn: ({ reason, details }: { reason: ReportReason; details: string }) =>
      submitProfileReport({
        reportedUserId: id,
        reportedUserName: provider?.name ?? '',
        reason,
        details,
      }),
    onSuccess: () => {
      setReportOpen(false);
      showSnackbar('Denúncia enviada. A equipe da Skillsy vai analisar.');
    },
  });

  if (isPending || !provider) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader title="Perfil" back />
        {isPending ? (
          <ActivityIndicator className="mt-12" />
        ) : (
          <Text className="p-8 text-center text-muted-foreground">
            Este perfil não está disponível.
          </Text>
        )}
      </View>
    );
  }

  const title = provider.companyName || provider.name;
  const reviewCount = provider.reviewCount || 0;
  const recommendationCount = provider.recommendationCount || 0;
  const place = [provider.publicCity, provider.publicState].filter(Boolean).join(' · ');
  const whatsapp = whatsappUrl(provider.whatsapp || '');
  const gallery = (provider.gallery || []).filter((item) => item.url);
  const isOwn = user?.uid === provider.uid;
  const myRating = ratings?.find((rating) => rating.fromId === user?.uid);

  // Signed-out members are sent to Perfil to sign in, like the FAB.
  const shareProfile = () =>
    Share.share({ message: `${title} na Skillsy: ${SITE_URL}/profile/${provider.uid}` });

  const requireUser = (action: () => void, message: string) => {
    if (user) return action();
    showSnackbar(message);
    router.navigate('/perfil');
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={title} back />
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {provider.bannerURL ? (
          <Image source={{ uri: provider.bannerURL }} style={{ height: 128 }} contentFit="cover" />
        ) : (
          <View className="h-32 bg-primary" />
        )}

        <View className="-mt-16 gap-4 px-4">
          <ProfileAvatar
            uri={provider.photoURL}
            name={provider.name}
            className="size-32 border-4 border-card"
            iconSize={56}
          />

          <View className="gap-1">
            <Text className="font-heading text-2xl font-bold leading-tight">{title}</Text>
            {provider.companyName ? (
              <Text className="text-sm text-muted-foreground">{provider.name}</Text>
            ) : null}
            <Text className="text-base text-muted-foreground">{providerRoleLabel(provider)}</Text>
          </View>

          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
            {reviewCount > 0 ? (
              <View className="flex-row items-center gap-1">
                <Star size={16} className="text-highlight" fill="currentColor" />
                <Text className="font-semibold">{formatRating(provider.rating)}</Text>
                <Text className="text-muted-foreground">({formatReviewCount(reviewCount)})</Text>
              </View>
            ) : (
              <Text className="text-muted-foreground">Novo na comunidade</Text>
            )}
            {recommendationCount > 0 ? (
              <View className="flex-row items-center gap-1.5">
                <ThumbsUp size={16} className="text-primary" />
                <Text className="font-semibold text-primary">
                  {formatRecommendationCount(recommendationCount)}
                </Text>
              </View>
            ) : null}
            {place ? (
              <View className="flex-row items-center gap-1">
                <MapPin size={16} className="text-muted-foreground" />
                <Text className="text-muted-foreground">{place}</Text>
              </View>
            ) : null}
          </View>

          {whatsapp ? (
            <WhatsAppButton url={whatsapp} size="lg" />
          ) : (
            <Text className="text-sm text-muted-foreground">
              Este profissional ainda não informou um WhatsApp.
            </Text>
          )}

          <View className="flex-row">
            {isOwn ? (
              <ActionButton
                icon={Pencil}
                label="Editar perfil"
                onPress={() => router.push('/editar-perfil')}
              />
            ) : (
              <>
                <ActionButton
                  icon={connected ? UserMinus : UserPlus}
                  label={connected ? 'Desconectar' : 'Conectar'}
                  active={connected}
                  disabled={connect.isPending}
                  onPress={() =>
                    requireUser(
                      () => connect.mutate(!connected),
                      'Entre na sua conta para salvar contatos.'
                    )
                  }
                />
                <ActionButton
                  icon={ThumbsUp}
                  label={recommended ? 'Indicado' : 'Indicar'}
                  active={Boolean(recommended)}
                  disabled={recommend.isPending}
                  onPress={() =>
                    requireUser(
                      () => recommend.mutate(),
                      'Entre na sua conta para indicar profissionais.'
                    )
                  }
                />
                <ActionButton
                  icon={Star}
                  label={myRating ? 'Avaliado' : 'Avaliar'}
                  active={Boolean(myRating)}
                  disabled={Boolean(myRating)}
                  onPress={() =>
                    requireUser(() => {
                      rate.reset();
                      setRatingOpen(true);
                    }, 'Entre na sua conta para avaliar profissionais.')
                  }
                />
              </>
            )}
            <ActionButton icon={Share2} label="Compartilhar" onPress={shareProfile} />
          </View>
          {isOwn ? (
            <Text className="text-sm text-muted-foreground">
              Este é o seu perfil. Indicações e avaliações vêm de outros membros.
            </Text>
          ) : null}

          {provider.bio ? (
            <Section title="Sobre">
              <Text className="leading-6 text-muted-foreground">{provider.bio}</Text>
            </Section>
          ) : null}

          {provider.serviceHours || provider.availability?.length || provider.experienceYears ? (
            <Section title="Atendimento">
              {provider.availability?.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {provider.availability.map((day) => (
                    <Badge key={day} variant="secondary">
                      <Text>{day}</Text>
                    </Badge>
                  ))}
                </View>
              ) : null}
              {provider.serviceHours ? (
                <View className="flex-row items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <Text className="text-muted-foreground">{provider.serviceHours}</Text>
                </View>
              ) : null}
              {provider.experienceYears ? (
                <Text className="text-muted-foreground">
                  {provider.experienceYears}{' '}
                  {Number(provider.experienceYears) === 1 ? 'ano' : 'anos'} de experiência
                </Text>
              ) : null}
            </Section>
          ) : null}

          {gallery.length ? (
            <Section title="Galeria">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3">
                {gallery.map((item, index) => (
                  <View key={`${index}-${item.url.slice(-12)}`} className="w-44 gap-1">
                    <Image
                      source={{ uri: item.url }}
                      style={{ width: 176, height: 132 }}
                      contentFit="cover"
                    />
                    {item.description ? (
                      <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </Section>
          ) : null}

          <Section title="Avaliações">
            {reviewCount > 0 ? (
              <View className="flex-row items-center gap-3">
                <Text className="font-heading text-4xl font-bold">
                  {formatRating(provider.rating)}
                </Text>
                <View className="gap-1">
                  <Stars value={Math.round(provider.rating || 0)} />
                  <Text className="text-sm text-muted-foreground">
                    {formatReviewCount(reviewCount)}
                  </Text>
                </View>
              </View>
            ) : null}
            {ratings?.length ? (
              ratings.slice(0, 10).map((rating) => (
                <View key={rating.id} className="gap-1 border-t border-border-subtle pt-3">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="flex-1 font-semibold" numberOfLines={1}>
                      {rating.authorName}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatFirestoreDate(rating.createdAt)}
                    </Text>
                  </View>
                  <Stars value={rating.score} size={14} />
                  {rating.comment ? (
                    <Text className="text-sm leading-5 text-muted-foreground">
                      {rating.comment}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text className="text-sm text-muted-foreground">
                Ainda sem avaliações. Contratou este profissional? Conte como foi.
              </Text>
            )}
          </Section>

          {recommendations?.length ? (
            <Section title="Indicado por">
              {recommendations.map((item) => (
                <View key={item.recommenderId} className="flex-row items-center gap-3">
                  <ProfileAvatar
                    uri={item.recommenderPhotoURL}
                    name={item.recommenderName}
                    className="size-8"
                    iconSize={16}
                  />
                  <Text className="flex-1">{item.recommenderName || 'Membro Skillsy'}</Text>
                </View>
              ))}
            </Section>
          ) : null}
        </View>

        {isOwn ? null : (
          <Pressable
            onPress={() =>
              requireUser(() => {
                report.reset();
                setReportOpen(true);
              }, 'Entre na sua conta para denunciar um perfil.')
            }
            accessibilityRole="button"
            className="mx-4 mt-6 min-h-12 flex-row items-center justify-center gap-2 active:bg-accent">
            <Flag size={16} className="text-destructive" />
            <Text className="text-sm font-medium text-destructive">Denunciar perfil</Text>
          </Pressable>
        )}

        <ReportSheet
          visible={reportOpen}
          name={provider.name.split(' ')[0]}
          submitting={report.isPending}
          error={report.error instanceof Error ? report.error.message : undefined}
          onSubmit={(reason, details) => report.mutate({ reason, details })}
          onClose={() => setReportOpen(false)}
        />
        <RatingSheet
          visible={ratingOpen}
          providerName={provider.name.split(' ')[0]}
          submitting={rate.isPending}
          error={rate.error instanceof Error ? rate.error.message : undefined}
          onSubmit={(score, comment) => rate.mutate({ score, comment })}
          onClose={() => setRatingOpen(false)}
        />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 border border-border-subtle bg-card p-4">
      <Text className="font-heading text-lg font-bold">{title}</Text>
      {children}
    </View>
  );
}
