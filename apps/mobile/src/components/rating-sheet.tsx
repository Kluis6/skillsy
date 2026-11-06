import { useState } from 'react';
import { View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Stars } from '@/components/stars';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';

const SCORE_LABEL = [
  '',
  'app.rating.score1',
  'app.rating.score2',
  'app.rating.score3',
  'app.rating.score4',
  'app.rating.score5',
] as const;

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
  const t = useT();

  return (
    <Sheet visible={visible} title={t("app.rating.title", { name: providerName })} onClose={onClose}>
      <View className="gap-4 px-4 pb-4">
        <Text className="text-sm text-muted-foreground">
          {t("app.rating.intro")}
        </Text>
        <View className="items-center gap-1">
          <Stars value={score} size={32} onChange={setScore} />
          <Text className="h-5 text-sm font-medium text-muted-foreground">
            {SCORE_LABEL[score] ? t(SCORE_LABEL[score]) : ''}
          </Text>
        </View>
        <Textarea
          value={comment}
          onChangeText={setComment}
          placeholder={t("app.rating.comment")}
          maxLength={500}
          textAlignVertical="top"
        />
        {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
        <Button disabled={!score || submitting} onPress={() => onSubmit(score, comment)}>
          <Text>{submitting ? t("app.rating.sending") : t("app.rating.submit")}</Text>
        </Button>
      </View>
    </Sheet>
  );
}
