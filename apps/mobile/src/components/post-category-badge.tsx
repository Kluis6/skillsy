import { POST_CATEGORY_LABELS } from '@skillsy/shared/post-utils';
import type { PostCategory } from '@skillsy/shared/types';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

/** "Vaga" in green and "Artigo" in amber, the same colors as the site. */
export function PostCategoryBadge({ category }: { category: PostCategory }) {
  const job = category === 'job';
  return (
    <Badge
      variant="outline"
      className={job ? 'border-success/20 bg-success/15' : 'border-warning/20 bg-warning/15'}>
      <Text className={job ? 'text-success' : 'text-warning-foreground'}>
        {POST_CATEGORY_LABELS[category]}
      </Text>
    </Badge>
  );
}
