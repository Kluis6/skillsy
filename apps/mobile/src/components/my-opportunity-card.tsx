import { getOpportunityStatus, needsOpportunityFollowUp } from '@skillsy/shared/opportunities';
import type { Opportunity } from '@skillsy/shared/types';
import { useState } from 'react';
import { View } from 'react-native';

import { Chip } from '@/components/chip';
import { OpportunityCard } from '@/components/opportunity-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useT } from '@/lib/i18n';

const STATUS_LABEL = {
  active: 'app.myOpportunity.active',
  closed: 'app.myOpportunity.closed',
  expired: 'app.myOpportunity.expired',
} as const;

type MyOpportunityCardProps = {
  opportunity: Opportunity;
  busy: boolean;
  onStatus: (status: 'active' | 'closed') => void;
  onFollowUp: (answers: {
    receivedResponse: boolean;
    platformSatisfied: boolean;
    closeRequest: boolean;
  }) => void;
};

/** The author's view of an opportunity: status, close/reactivate and the
 * 20-day follow-up, like "Minhas oportunidades" on the site. */
export function MyOpportunityCard({
  opportunity,
  busy,
  onStatus,
  onFollowUp,
}: MyOpportunityCardProps) {
  const status = getOpportunityStatus(opportunity);
  const t = useT();
  const [receivedResponse, setReceivedResponse] = useState(true);
  const [platformSatisfied, setPlatformSatisfied] = useState(true);

  return (
    <OpportunityCard
      opportunity={opportunity}
      badge={
        <Badge
          variant="outline"
          className={
            status === 'active' ? 'border-success/30 bg-success/10' : 'border-border bg-muted'
          }>
          <Text className={status === 'active' ? 'text-success' : 'text-muted-foreground'}>
            {t(STATUS_LABEL[status])}
          </Text>
        </Badge>
      }>
      {needsOpportunityFollowUp(opportunity) && !opportunity.followUpAnsweredAt ? (
        <View className="gap-3 border border-primary/30 bg-primary/5 p-4">
          <Text className="font-semibold">{t("app.myOpportunity.followUpTitle")}</Text>
          <Text className="text-sm text-muted-foreground">{t('opportunities.followUpResponse')}</Text>
          <View className="flex-row gap-2">
            <Chip
              label={t('opportunities.yes')}
              selected={receivedResponse}
              onPress={() => setReceivedResponse(true)}
            />
            <Chip
              label={t('opportunities.notYet')}
              selected={!receivedResponse}
              onPress={() => setReceivedResponse(false)}
            />
          </View>
          <Text className="text-sm text-muted-foreground">
            {t('opportunities.followUpSatisfied')}
          </Text>
          <View className="flex-row gap-2">
            <Chip
              label={t('opportunities.yes')}
              selected={platformSatisfied}
              onPress={() => setPlatformSatisfied(true)}
            />
            <Chip
              label={t('opportunities.couldBeBetter')}
              selected={!platformSatisfied}
              onPress={() => setPlatformSatisfied(false)}
            />
          </View>
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy}
              onPress={() =>
                onFollowUp({ receivedResponse, platformSatisfied, closeRequest: false })
              }>
              <Text>{t('opportunities.keepVisible')}</Text>
            </Button>
            <Button
              className="flex-1"
              disabled={busy}
              onPress={() =>
                onFollowUp({ receivedResponse, platformSatisfied, closeRequest: true })
              }>
              <Text>{t("app.myOpportunity.close")}</Text>
            </Button>
          </View>
        </View>
      ) : status === 'active' ? (
        <Button variant="outline" disabled={busy} onPress={() => onStatus('closed')}>
          <Text>{t('opportunities.close')}</Text>
        </Button>
      ) : (
        <Button variant="outline" disabled={busy} onPress={() => onStatus('active')}>
          <Text>{t("app.myOpportunity.reopen")}</Text>
        </Button>
      )}
    </OpportunityCard>
  );
}
