import type { UserProfile } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryTile } from '@/components/home/category-tile';
import { PromoBanner } from '@/components/home/promo-banner';
import { PostTile } from '@/components/home/post-tile';
import { ProviderTile } from '@/components/home/provider-tile';
import { SearchLauncher } from '@/components/home/search-launcher';
import { SectionHeader } from '@/components/home/section-header';
import { FeaturedServiceCard, ServiceCard } from '@/components/home/service-card';
import { useSnackbar } from '@/components/snackbar';
import { Text } from '@/components/ui/text';
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

/** Início, modeled on GetNinjas' home: search, shortcuts, service carousels
 * and calls to action, in Skillsy's identity and vocabulary. */
export default function InicioScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  // Same query as an empty search on Buscar, so the cache is shared.
  const { data: providers } = useQuery({
    queryKey: ['providers', '', '', ''],
    queryFn: () => searchProviders({ term: '' }),
  });

  const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: getPublishedPosts });

  const search = (q: string) => router.navigate({ pathname: '/buscar', params: { q } });
  const openProfile = (provider: UserProfile) => {
    queryClient.setQueryData(['profile', provider.uid], provider);
    router.push({ pathname: '/profissional/[id]', params: { id: provider.uid } });
  };
  const publish = () => {
    if (user) return router.push('/oportunidade/nova');
    showSnackbar('Entre na sua conta para publicar uma oportunidade.');
    router.navigate('/perfil');
  };
  const firstName = (me?.name || user?.displayName || '').trim().split(' ')[0];
  const [first, second, third, fourth] = SERVICE_SECTIONS;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-8 pb-8">
        <View className="gap-5 border-b border-border-subtle bg-card pb-6 pt-4">
          <Text className="px-4 font-heading text-3xl font-bold">
            {firstName ? `Olá, ${firstName}` : 'Boas-vindas'}
          </Text>
          <SearchLauncher
            onPress={() => router.navigate({ pathname: '/buscar', params: { focar: '1' } })}
          />
          <View className="flex-row gap-3 px-4">
            {POPULAR_CATEGORIES.slice(0, 4).map((category) => (
              <CategoryTile
                key={category}
                label={category}
                icon={categoryIcon(category)}
                onPress={() => search(category)}
              />
            ))}
          </View>
        </View>

        {user ? null : (
          <PromoBanner
            title="Acesse agora"
            description="Entre ou crie sua conta e acompanhe suas oportunidades."
            onPress={() => router.navigate('/perfil')}
          />
        )}

        <Carousel section={first} onSearch={search} />
        <FeaturedServiceCard
          title={FEATURED_SERVICE.title}
          description={FEATURED_SERVICE.description}
          image={FEATURED_SERVICE.image}
          onPress={() => search(FEATURED_SERVICE.search)}
        />
        <Carousel section={second} onSearch={search} />

        {providers?.length ? (
          <View className="gap-3">
            <SectionHeader title="Profissionais da comunidade" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4">
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
            <SectionHeader title="Novidades e vagas" onAction={() => router.push('/artigos')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4">
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
            title="Seja profissional"
            description="Divulgue seu trabalho para a comunidade e receba avisos de oportunidades. Sem custo."
            actionLabel="Quero anunciar"
            onPress={() => (user ? openSite('/profile') : router.navigate('/perfil'))}
          />
        )}

        <Carousel section={third} onSearch={search} />
        <Carousel section={fourth} onSearch={search} />

        <PromoBanner
          image={BANNER_IMAGES.procurando}
          title="O que você precisa?"
          description="Publique uma oportunidade e avise os profissionais do mesmo serviço e estado."
          actionLabel="Publicar oportunidade"
          onPress={publish}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Carousel({
  section,
  onSearch,
}: {
  section: ServiceSection;
  onSearch: (q: string) => void;
}) {
  return (
    <View className="gap-3">
      <SectionHeader title={section.title} onAction={() => router.navigate('/buscar')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4">
        {section.services.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            image={service.image}
            onPress={() => onSearch(service.search)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
