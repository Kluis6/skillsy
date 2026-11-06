import {
  REPORT_REASON_OPTIONS,
  type ReportReason,
} from '@skillsy/shared/reporting';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLabels, useT } from '@/lib/i18n';

type ReportSheetProps = {
  visible: boolean;
  name: string;
  submitting: boolean;
  error?: string;
  onSubmit: (reason: ReportReason, details: string) => void;
  onClose: () => void;
};

/** Report a profile with the same reasons as the site. */
export function ReportSheet({
  visible,
  name,
  submitting,
  error,
  onSubmit,
  onClose,
}: ReportSheetProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const t = useT();
  const labels = useLabels();

  return (
    <Sheet visible={visible} title={t("app.report.title", { name })} onClose={onClose}>
      <ScrollView contentContainerClassName="gap-3 px-4 pb-4" keyboardShouldPersistTaps="handled">
        <Text className="text-sm text-muted-foreground">
          {t("app.report.intro")}
        </Text>
        <View accessibilityRole="radiogroup">
          {REPORT_REASON_OPTIONS.map((option) => {
            const selected = reason === option;
            return (
              <Pressable
                key={option}
                onPress={() => setReason(option)}
                accessibilityRole="radio"
                aria-checked={selected}
                className="min-h-12 flex-row items-center gap-3 active:bg-accent">
                <View
                  className={cn(
                    'size-5 items-center justify-center rounded-full border-2',
                    selected ? 'border-destructive' : 'border-muted-foreground'
                  )}>
                  {selected ? <View className="size-2.5 rounded-full bg-destructive" /> : null}
                </View>
                <Text className="flex-1">{labels.reason(option)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Textarea
          value={details}
          onChangeText={setDetails}
          placeholder={t("app.report.details")}
          maxLength={1000}
          textAlignVertical="top"
        />
        {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
        <Button
          variant="destructive"
          disabled={!reason || submitting}
          onPress={() => reason && onSubmit(reason, details)}>
          <Text>{submitting ? t("app.report.sending") : t("app.report.submit")}</Text>
        </Button>
      </ScrollView>
    </Sheet>
  );
}
