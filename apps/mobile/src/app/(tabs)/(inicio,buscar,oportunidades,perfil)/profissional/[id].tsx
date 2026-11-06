import { whatsappUrl } from '@skillsy/shared/contact';
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
import { siteUrl } from '@/lib/site';
import { useFormat, useLabels, useT, useValidationMessage } from '@/lib/i18n';

export default function ProfissionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const t = useT();
  const tv = useValidationMessage();
  const labels = useLabels();
  const format = useFormat();
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
      showSnackbar(added ? t("app.provider.recommended") : t("app.provider.unrecommended"));
    },
    onError: (error) =>
      showSnackbar(
        error instanceof Error ? tv(error.message) : t("app.provider.recommendError")
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
      showSnackbar(next ? t("app.provider.contactAdded") : t("app.provider.contactRemoved"));
    },
    onError: () => showSnackbar(t("app.provider.contactError")),
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
      showSnackbar(t("app.provider.rated"));
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
      showSnackbar(t("app.provider.reported"));
    },
  });

  if (isPending || !provider) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader title={t("app.provider.title")} back />
        {isPending ? (
          <ActivityIndicator className="mt-12" />
        ) : (
          <Text className="p-8 text-center text-muted-foreground">
            {t("app.provider.unavailable")}
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
    Share.share({
      message: t("app.provider.shareMessage", { name: title, url: siteUrl(`/profile/${provider.uid}`) }),
    });

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

        <View className="-mt-16 gap-card px-4">
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
            <Text className="text-base text-muted-foreground">{format.role(provider)}</Text>
          </View>

          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
            {reviewCount > 0 ? (
              <View className="flex-row items-center gap-1">
                <Star size={16} className="text-highlight" fill="currentColor" />
                <Text className="font-semibold">{format.rating(provider.rating)}</Text>
                <Text className="text-muted-foreground">({format.reviews(reviewCount)})</Text>
              </View>
            ) : (
              <Text className="text-muted-foreground">{t("app.provider.newMember")}</Text>
            )}
            {recommendationCount > 0 ? (
              <View className="flex-row items-center gap-1.5">
                <ThumbsUp size={16} className="text-primary" />
                <Text className="font-semibold text-primary">
                  {format.recommendations(recommendationCount)}
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
              {t("app.provider.noWhatsapp")}
            </Text>
          )}

          <View className="flex-row">
            {isOwn ? (
              <ActionButton
                icon={Pencil}
                label={t("app.provider.edit")}
                onPress={() => router.push('/editar-perfil')}
              />
            ) : (
              <>
                <ActionButton
                  icon={connected ? UserMinus : UserPlus}
                  label={connected ? t("app.provider.disconnect") : t("app.provider.connect")}
                  active={connected}
                  disabled={connect.isPending}
                  onPress={() =>
                    requireUser(
                      () => connect.mutate(!connected),
                      t("app.provider.signInContacts")
                    )
                  }
                />
                <ActionButton
                  icon={ThumbsUp}
                  label={recommended ? t("app.provider.recommendedLabel") : t("app.provider.recommend")}
                  active={Boolean(recommended)}
                  disabled={recommend.isPending}
                  onPress={() =>
                    requireUser(
                      () => recommend.mutate(),
                      t("app.provider.signInRecommend")
                    )
                  }
                />
                <ActionButton
                  icon={Star}
                  label={myRating ? t("app.provider.ratedLabel") : t("app.provider.rate")}
                  active={Boolean(myRating)}
                  disabled={Boolean(myRating)}
                  onPress={() =>
                    requireUser(() => {
                      rate.reset();
                      setRatingOpen(true);
                    }, t("app.provider.signInRate"))
                  }
                />
              </>
            )}
            <ActionButton icon={Share2} label={t("app.provider.share")} onPress={shareProfile} />
          </View>
          {isOwn ? (
            <Text className="text-sm text-muted-foreground">
              {t("app.provider.ownProfile")}
            </Text>
          ) : null}

          {provider.bio ? (
            <Section title={t("app.provider.about")}>
              <Text className="leading-6 text-muted-foreground">{provider.bio}</Text>
            </Section>
          ) : null}

          {provider.serviceHours || provider.availability?.length || provider.experienceYears ? (
            <Section title={t("app.provider.service")}>
              {provider.availability?.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {provider.availability.map((day) => (
                    <Badge key={day} variant="secondary">
                      <Text>{labels.day(day)}</Text>
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
                  {t('app.provider.experience', { count: Number(provider.experienceYears) })}
                </Text>
              ) : null}
            </Section>
          ) : null}

          {gallery.length ? (
            <Section title={t("app.provider.gallery")}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-card">
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

          <Section title={t("app.provider.reviews")}>
            {reviewCount > 0 ? (
              <View className="flex-row items-center gap-3">
                <Text className="font-heading text-4xl font-bold">
                  {format.rating(provider.rating)}
                </Text>
                <View className="gap-1">
                  <Stars value={Math.round(provider.rating || 0)} />
                  <Text className="text-sm text-muted-foreground">
                    {format.reviews(reviewCount)}
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
                      {format.date(rating.createdAt)}
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
                {t("app.provider.noReviews")}
              </Text>
            )}
          </Section>

          {recommendations?.length ? (
            <Section title={t("app.provider.recommendedBy")}>
              {recommendations.map((item) => (
                <View key={item.recommenderId} className="flex-row items-center gap-3">
                  <ProfileAvatar
                    uri={item.recommenderPhotoURL}
                    name={item.recommenderName}
                    className="size-8"
                    iconSize={16}
                  />
                  <Text className="flex-1">{item.recommenderName || t("app.provider.skillsyMember")}</Text>
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
              }, t("app.provider.signInReport"))
            }
            accessibilityRole="button"
            className="mx-4 mt-6 min-h-12 flex-row items-center justify-center gap-2 active:bg-accent">
            <Flag size={16} className="text-destructive" />
            <Text className="text-sm font-medium text-destructive">{t("app.provider.report")}</Text>
          </Pressable>
        )}

        <ReportSheet
          visible={reportOpen}
          name={provider.name.split(' ')[0]}
          submitting={report.isPending}
          error={report.error instanceof Error ? tv(report.error.message) : undefined}
          onSubmit={(reason, details) => report.mutate({ reason, details })}
          onClose={() => setReportOpen(false)}
        />
        <RatingSheet
          visible={ratingOpen}
          providerName={provider.name.split(' ')[0]}
          submitting={rate.isPending}
          error={rate.error instanceof Error ? tv(rate.error.message) : undefined}
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
