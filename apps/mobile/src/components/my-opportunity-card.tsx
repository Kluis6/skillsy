import { getOpportunityStatus, needsOpportunityFollowUp } from '@skillsy/shared/opportunities';
import type { Opportunity } from '@skillsy/shared/types';
import { useState } from 'react';
import { View } from 'react-native';

import { Chip } from '@/components/chip';
import { OpportunityCard } from '@/components/opportunity-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const STATUS_LABEL = { active: 'Ativa', closed: 'Encerrada', expired: 'Expirada' } as const;

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
            {STATUS_LABEL[status]}
          </Text>
        </Badge>
      }>
      {needsOpportunityFollowUp(opportunity) && !opportunity.followUpAnsweredAt ? (
        <View className="gap-3 border border-primary/30 bg-primary/5 p-4">
          <Text className="font-semibold">Já se passaram 20 dias. Como foi?</Text>
          <Text className="text-sm text-muted-foreground">Algum profissional respondeu?</Text>
          <View className="flex-row gap-2">
            <Chip
              label="Sim"
              selected={receivedResponse}
              onPress={() => setReceivedResponse(true)}
            />
            <Chip
              label="Ainda não"
              selected={!receivedResponse}
              onPress={() => setReceivedResponse(false)}
            />
          </View>
          <Text className="text-sm text-muted-foreground">
            Você ficou satisfeito com o Skillsy?
          </Text>
          <View className="flex-row gap-2">
            <Chip
              label="Sim"
              selected={platformSatisfied}
              onPress={() => setPlatformSatisfied(true)}
            />
            <Chip
              label="Pode melhorar"
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
              <Text>Manter visível</Text>
            </Button>
            <Button
              className="flex-1"
              disabled={busy}
              onPress={() =>
                onFollowUp({ receivedResponse, platformSatisfied, closeRequest: true })
              }>
              <Text>Encerrar</Text>
            </Button>
          </View>
        </View>
      ) : status === 'active' ? (
        <Button variant="outline" disabled={busy} onPress={() => onStatus('closed')}>
          <Text>Encerrar oportunidade</Text>
        </Button>
      ) : (
        <Button variant="outline" disabled={busy} onPress={() => onStatus('active')}>
          <Text>Reativar por mais 30 dias</Text>
        </Button>
      )}
    </OpportunityCard>
  );
}
