import { formatFirestoreDate, OPPORTUNITY_URGENCY } from '@skillsy/shared/opportunities';
import type { Opportunity } from '@skillsy/shared/types';
import { AlertTriangle, Clock3, MapPin } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { cn } from '@/lib/utils';

type OpportunityCardProps = {
  opportunity: Opportunity;
  /** WhatsApp link to answer, only for signed-in professionals (not the author). */
  contactUrl?: string | null;
  /** Shown before the category, e.g. the status on "Minhas". */
  badge?: ReactNode;
  /** Extra actions at the bottom of the card. */
  children?: ReactNode;
};

export function OpportunityCard({
  opportunity,
  contactUrl,
  badge,
  children,
}: OpportunityCardProps) {
  const urgency = opportunity.urgency || 'normal';
  const place = [opportunity.neighborhood, opportunity.city].filter(Boolean).join(', ');

  return (
    <View className="gap-3 border border-border-subtle bg-card p-4 shadow-sm shadow-black/5">
      <View className="flex-row flex-wrap items-center gap-2">
        {badge}
        <Text className="text-xs font-semibold text-primary">{opportunity.category}</Text>
        {urgency !== 'normal' ? (
          <Badge
            variant="outline"
            className={cn(
              'flex-row gap-1',
              urgency === 'urgent'
                ? 'border-destructive/20 bg-destructive/10'
                : 'border-primary/20 bg-primary/10'
            )}>
            {urgency === 'urgent' ? (
              <AlertTriangle size={12} className="text-destructive" />
            ) : (
              <Clock3 size={12} className="text-primary" />
            )}
            <Text className={urgency === 'urgent' ? 'text-destructive' : 'text-primary'}>
              {OPPORTUNITY_URGENCY[urgency].label}
            </Text>
          </Badge>
        ) : null}
      </View>

      <View className="gap-1">
        <Text className="text-lg font-bold leading-tight">{opportunity.title}</Text>
        <Text className="text-sm leading-5 text-muted-foreground" numberOfLines={4}>
          {opportunity.description}
        </Text>
      </View>

      <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
        <View className="flex-row items-center gap-1">
          <MapPin size={14} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">
            {place} · {opportunity.state}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Clock3 size={14} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">
            {formatFirestoreDate(opportunity.createdAt)}
          </Text>
        </View>
      </View>

      {contactUrl ? <WhatsAppButton url={contactUrl} label="Tenho interesse" /> : null}
      {children}
    </View>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <View className="gap-3 border border-border-subtle bg-card p-4">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </View>
  );
}
