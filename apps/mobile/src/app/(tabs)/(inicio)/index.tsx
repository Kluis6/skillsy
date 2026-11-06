import { byOrigin } from '@skillsy/shared/i18n/origin';
import type { UserProfile } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { CategoryTile } from '@/components/home/category-tile';
import { PromoBanner } from '@/components/home/promo-banner';
import { PostTile } from '@/components/home/post-tile';
import { ProviderTile } from '@/components/home/provider-tile';
import { SearchLauncher } from '@/components/home/search-launcher';
import { SectionHeader } from '@/components/home/section-header';
import { FeaturedServiceCard, ServiceCard } from '@/components/home/service-card';
import { useSnackbar } from '@/components/snackbar';
import { useAuth } from '@/lib/auth';
import { categoryIcon, POPULAR_CATEGORIES } from '@/lib/category-icons';
import { getPublishedPosts } from '@/lib/posts';
import { getOwnProfile, searchProviders } from '@/lib/providers';
import {
  BANNER_IMAGES,
  FEATURED_SERVICE,
  SERVICE_SECTIONS,
  type ServiceSection,
} from '@/lib/service-catalog';
import { openSite } from '@/lib/site';
import { useLabels, useLocale, useT } from '@/lib/i18n';

/** Início, modeled on GetNinjas' home: search, shortcuts, service carousels
 * and calls to action, in Skillsy's identity and vocabulary. */
export default function InicioScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const t = useT();
  const labels = useLabels();
  const { locale } = useLocale();
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  // Same query as an empty search on Buscar, so the cache is shared.
  const { data: providers } = useQuery({
    queryKey: ['providers', '', '', '', locale],
    queryFn: () => searchProviders({ term: '', language: locale }),
  });

  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: getPublishedPosts,
    select: (items) => byOrigin(items, { language: locale }),
  });

  const search = (q: string) => router.navigate({ pathname: '/buscar', params: { q } });
  const openProfile = (provider: UserProfile) => {
    queryClient.setQueryData(['profile', provider.uid], provider);
    router.push({ pathname: '/profissional/[id]', params: { id: provider.uid } });
  };
  const publish = () => {
    if (user) return router.push('/oportunidade/nova');
    showSnackbar(t("app.home.signInToPublish"));
    router.navigate('/perfil');
  };
  const firstName = (me?.name || user?.displayName || '').trim().split(' ')[0];
  const [first, second, third, fourth] = SERVICE_SECTIONS;

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={firstName ? t("app.home.hello", { name: firstName }) : t("app.home.welcome")} />
      <ScrollView contentContainerClassName="gap-8 pb-8">
        <View className="gap-5 border-b border-border bg-card pb-6 pt-4">
          <SearchLauncher
            onPress={() => router.navigate({ pathname: '/buscar', params: { focar: '1' } })}
          />
          <View className="flex-row gap-card px-4">
            {POPULAR_CATEGORIES.slice(0, 4).map((category) => (
              <CategoryTile
                key={category}
                label={labels.category(category)}
                icon={categoryIcon(category)}
                onPress={() => search(category)}
              />
            ))}
          </View>
        </View>

        {user ? null : (
          <PromoBanner
            title={t("app.home.accessNow")}
            description={t("app.home.accessNowText")}
            onPress={() => router.navigate('/perfil')}
          />
        )}

        <Carousel section={first} onSearch={search} />
        <FeaturedServiceCard
          title={t(FEATURED_SERVICE.title)}
          description={t(FEATURED_SERVICE.description)}
          image={FEATURED_SERVICE.image}
          onPress={() => search(FEATURED_SERVICE.search)}
        />
        <Carousel section={second} onSearch={search} />

        {providers?.length ? (
          <View className="gap-3">
            <SectionHeader title={t("app.home.providers")} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-card px-4">
              {providers.slice(0, 10).map((provider) => (
                <ProviderTile
                  key={provider.uid}
                  provider={provider}
                  onPress={() => openProfile(provider)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {posts?.length ? (
          <View className="gap-3">
            <SectionHeader title={t("app.home.posts")} onAction={() => router.push('/artigos')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-card px-4">
              {posts.slice(0, 10).map((post) => (
                <PostTile
                  key={post.id ?? post.slug}
                  post={post}
                  onPress={() => {
                    queryClient.setQueryData(['post', post.slug], post);
                    router.push({ pathname: '/artigo/[slug]', params: { slug: post.slug } });
                  }}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {me?.isProvider ? null : (
          <PromoBanner
            tone="brand"
            image={BANNER_IMAGES.comunidade}
            title={t("app.home.beProfessional")}
            description={t("app.home.beProfessionalText")}
            actionLabel={t("app.home.advertise")}
            onPress={() => (user ? openSite('/profile') : router.navigate('/perfil'))}
          />
        )}

        <Carousel section={third} onSearch={search} />
        <Carousel section={fourth} onSearch={search} />

        <PromoBanner
          image={BANNER_IMAGES.procurando}
          title={t("app.home.whatDoYouNeed")}
          description={t("app.home.whatDoYouNeedText")}
          actionLabel={t("app.home.publish")}
          onPress={publish}
        />
      </ScrollView>
    </View>
  );
}

function Carousel({
  section,
  onSearch,
}: {
  section: ServiceSection;
  onSearch: (q: string) => void;
}) {
  const t = useT();
  return (
    <View className="gap-3">
      <SectionHeader title={t(section.title)} onAction={() => router.navigate('/buscar')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-card px-4">
        {section.services.map((service) => (
          <ServiceCard
            key={service.title}
            title={t(service.title)}
            image={service.image}
            onPress={() => onSearch(service.search)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
