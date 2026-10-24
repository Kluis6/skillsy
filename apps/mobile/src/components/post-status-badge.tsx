import { POST_STATUS_LABELS } from '@skillsy/shared/post-utils';
import type { PostStatus } from '@skillsy/shared/types';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const TONE: Record<PostStatus, string> = {
  draft: 'border-border bg-muted',
  pending_review: 'border-warning-border bg-warning/10',
  published: 'border-success/30 bg-success/10',
  rejected: 'border-destructive/30 bg-destructive/10',
};

const TEXT: Record<PostStatus, string> = {
  draft: 'text-muted-foreground',
  pending_review: 'text-warning-foreground',
  published: 'text-success',
  rejected: 'text-destructive',
};

/** Rascunho / Em revisão / Publicado / Rejeitado, colored like the site. */
export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant="outline" className={cn(TONE[status])}>
      <Text className={cn('text-xs font-medium', TEXT[status])}>{POST_STATUS_LABELS[status]}</Text>
    </Badge>
  );
}
