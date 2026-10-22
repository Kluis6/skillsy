import { useState } from 'react';
import { View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Stars } from '@/components/stars';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';

const SCORE_LABEL = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

type RatingSheetProps = {
  visible: boolean;
  providerName: string;
  submitting: boolean;
  error?: string;
  onSubmit: (score: number, comment: string) => void;
  onClose: () => void;
};

export function RatingSheet({
  visible,
  providerName,
  submitting,
  error,
  onSubmit,
  onClose,
}: RatingSheetProps) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <Sheet visible={visible} title={`Avaliar ${providerName}`} onClose={onClose}>
      <View className="gap-4 px-4 pb-4">
        <Text className="text-sm text-muted-foreground">
          Cada membro avalia um profissional uma vez. Conte como foi o serviço.
        </Text>
        <View className="items-center gap-1">
          <Stars value={score} size={32} onChange={setScore} />
          <Text className="h-5 text-sm font-medium text-muted-foreground">
            {SCORE_LABEL[score]}
          </Text>
        </View>
        <Textarea
          value={comment}
          onChangeText={setComment}
          placeholder="Comentário (opcional)"
          maxLength={500}
          textAlignVertical="top"
        />
        {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
        <Button disabled={!score || submitting} onPress={() => onSubmit(score, comment)}>
          <Text>{submitting ? 'Enviando…' : 'Enviar avaliação'}</Text>
        </Button>
      </View>
    </Sheet>
  );
}
