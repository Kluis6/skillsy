import type { PostCategory } from '@skillsy/shared/types';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { useT } from '@/lib/i18n';

/** "Vaga" in green and "Artigo" in amber, the same colors as the site. */
export function PostCategoryBadge({ category }: { category: PostCategory }) {
  const t = useT();
  const job = category === 'job';
  return (
    <Badge
      variant="outline"
      className={job ? 'border-success/20 bg-success/15' : 'border-warning/20 bg-warning/15'}>
      <Text className={job ? 'text-success' : 'text-warning-foreground'}>
        {job ? t('posts.categoryJob') : t('posts.categoryArticle')}
      </Text>
    </Badge>
  );
}
