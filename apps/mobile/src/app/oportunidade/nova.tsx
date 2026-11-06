import {
  OPPORTUNITY_FIELDS,
  OPPORTUNITY_URGENCIES,
  type OpportunityFormInput,
} from '@skillsy/shared/opportunities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Check, LayoutGrid } from '@/lib/icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Chip } from '@/components/chip';
import { OptionSheet } from '@/components/option-sheet';
import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { categoryIcon, POPULAR_CATEGORIES } from '@/lib/category-icons';
import { STATE_OPTIONS, useCategoryOptions } from '@/lib/filters';
import type { MessageKey } from '@skillsy/shared/i18n/keys';
import { createOpportunity } from '@/lib/opportunities';
import { getOwnProfile } from '@/lib/providers';
import { cn } from '@/lib/utils';
import { useLabels, useLocale, useT, useValidationMessage } from '@/lib/i18n';

const STEPS = [
  'app.newOpportunity.stepService',
  'app.newOpportunity.stepWhat',
  'app.newOpportunity.stepWhere',
  'app.newOpportunity.stepUrgency',
  'app.newOpportunity.stepReview',
] as const satisfies readonly MessageKey[];

/** Urgency labels and help, shared with the site's dictionary. */
const URGENCY_TEXT = {
  normal: { label: 'opportunities.urgencyNormal', help: 'opportunities.urgencyNormalHelp' },
  soon: { label: 'opportunities.urgencySoon', help: 'opportunities.urgencySoonHelp' },
  urgent: { label: 'opportunities.urgencyUrgent', help: 'opportunities.urgencyUrgentHelp' },
} as const satisfies Record<string, { label: MessageKey; help: MessageKey }>;

const fits = (value: string, field: keyof typeof OPPORTUNITY_FIELDS) => {
  const { min, max } = OPPORTUNITY_FIELDS[field];
  const length = value.trim().length;
  return length >= min && length <= max;
};

/** Publishing in short steps, one decision per screen (like GetNinjas'
 * request flow), with the same limits the site and firestore.rules check. */
export default function NovaOportunidadeScreen() {
  const { user } = useAuth();
  const t = useT();
  const tv = useValidationMessage();
  const labels = useLabels();
  const { locale } = useLocale();
  const categoryOptions = useCategoryOptions();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState<'category' | 'state' | null>(null);
  // city/state stay undefined until edited, so they show the profile's values.
  type Draft = Omit<OpportunityFormInput, 'city' | 'state'> & { city?: string; state?: string };
  const [draft, setDraft] = useState<Draft>({
    category: '',
    title: '',
    description: '',
    neighborhood: '',
    urgency: 'normal',
    // Written in the app's language (notifications and lists use it).
    language: locale,
  });
  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  const profileCity = typeof me?.location === 'string' ? me.location.split(',')[0].trim() : '';
  const form: OpportunityFormInput = {
    ...draft,
    city: draft.city ?? profileCity,
    state: draft.state ?? me?.businessState ?? '',
  };

  const publish = useMutation({
    mutationFn: () =>
      createOpportunity(user!.uid, form, {
        name: me?.name ?? user?.displayName ?? '',
        whatsapp: me?.whatsapp,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['my-opportunities'] });
      if (router.canGoBack()) router.back();
      else router.replace('/oportunidades');
            showSnackbar(t("app.newOpportunity.published"));
    },
  });

  const stepValid = [
    fits(form.category, 'category'),
    fits(form.title, 'title') && fits(form.description, 'description'),
    fits(form.state, 'state') && fits(form.city, 'city') && fits(form.neighborhood, 'neighborhood'),
    OPPORTUNITY_URGENCIES.includes(form.urgency),
    Boolean(me?.whatsapp),
  ][step];
  const last = step === STEPS.length - 1;
  const stateLabel = STATE_OPTIONS.find((option) => option.value === form.state)?.label;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title={t("app.newOpportunity.title")} back />
      <View className="gap-2 bg-card px-4 pb-3 pt-3">
        <Text className="text-sm text-muted-foreground">
          {t("app.newOpportunity.stepOf", { step: step + 1, total: STEPS.length, name: t(STEPS[step]) })}
        </Text>
        <View className="h-1 bg-muted" accessibilityRole="progressbar">
          <View
            className="h-1 bg-primary"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </View>
      </View>

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerClassName="gap-5 p-4" keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <>
              <Heading title={t("app.newOpportunity.whichService")} />
              <View className="flex-row flex-wrap">
                {POPULAR_CATEGORIES.map((category) => (
                  <ServiceOption
                    key={category}
                    label={labels.category(category)}
                    icon={categoryIcon(category)}
                    selected={form.category === category}
                    onPress={() => update({ category })}
                  />
                ))}
                <ServiceOption
                  label={
                    form.category && !POPULAR_CATEGORIES.includes(form.category as never)
                                            ? labels.category(form.category)
                      : t("app.newOpportunity.otherServices")
                  }
                  icon={LayoutGrid}
                  selected={
                    Boolean(form.category) && !POPULAR_CATEGORIES.includes(form.category as never)
                  }
                  onPress={() => setSheet('category')}
                />
              </View>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Heading
                title={t("app.newOpportunity.tellUs")}
                description={t("app.newOpportunity.tellUsText")}
              />
              <Field label={t("app.newOpportunity.titleLabel")} hint={`${form.title.trim().length}/120`}>
                <Input
                  value={form.title}
                  onChangeText={(title) => update({ title })}
                  placeholder={t("app.newOpportunity.titlePlaceholder")}
                  maxLength={120}
                />
              </Field>
              <Field
                label={t("app.newOpportunity.description")}
                hint={
                  form.description.trim().length < 20
                    ? t("app.newOpportunity.descriptionMin", { count: form.description.trim().length })
                    : `${form.description.trim().length}/2000`
                }>
                <Textarea
                  value={form.description}
                  onChangeText={(description) => update({ description })}
                  placeholder={t("app.newOpportunity.descriptionPlaceholder")}
                  maxLength={2000}
                  textAlignVertical="top"
                />
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Heading
                title={t("app.newOpportunity.where")}
                description={t("app.newOpportunity.whereText")}
              />
              <Field label={t("app.newOpportunity.state")}>
                <View className="flex-row">
                  <Chip
                    label={stateLabel || t("app.newOpportunity.chooseState")}
                    selected={Boolean(form.state)}
                    menu
                    onPress={() => setSheet('state')}
                  />
                </View>
              </Field>
              <Field label={t("app.newOpportunity.city")}>
                <Input
                  value={form.city}
                  onChangeText={(city) => update({ city })}
                  maxLength={100}
                />
              </Field>
              <Field label={t("app.newOpportunity.neighborhood")}>
                <Input
                  value={form.neighborhood}
                  onChangeText={(neighborhood) => update({ neighborhood })}
                  maxLength={100}
                />
              </Field>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Heading title={t("app.newOpportunity.urgencyQuestion")} />
              {OPPORTUNITY_URGENCIES.map((urgency) => {
                const selected = form.urgency === urgency;
                return (
                  <Pressable
                    key={urgency}
                    onPress={() => update({ urgency })}
                    accessibilityRole="radio"
                    aria-checked={selected}
                    className={cn(
                      'flex-row items-start gap-3 border p-4',
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card active:bg-accent'
                    )}>
                    <View
                      className={cn(
                        'mt-0.5 size-5 items-center justify-center rounded-full border-2',
                        selected ? 'border-primary' : 'border-muted-foreground'
                      )}>
                      {selected ? <View className="size-2.5 rounded-full bg-primary" /> : null}
                    </View>
                    <View className="flex-1 gap-1">
                      <Text className={cn('font-semibold', selected && 'text-primary')}>
                        {t(URGENCY_TEXT[urgency].label)}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {t(URGENCY_TEXT[urgency].help)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Heading title={t("app.newOpportunity.review")} />
              <View className="gap-3 border border-border-subtle bg-card p-4">
                <Summary label={t("app.newOpportunity.stepService")} value={labels.category(form.category)} onEdit={() => setStep(0)} />
                <Summary label={t("app.newOpportunity.titleLabel")} value={form.title} onEdit={() => setStep(1)} />
                <Summary label={t("app.newOpportunity.description")} value={form.description} onEdit={() => setStep(1)} />
                <Summary
                  label={t("app.newOpportunity.stepWhere")}
                  value={`${form.neighborhood}, ${form.city} · ${form.state}`}
                  onEdit={() => setStep(2)}
                />
                <Summary
                  label={t("app.newOpportunity.stepUrgency")}
                  value={t(URGENCY_TEXT[form.urgency].label)}
                  onEdit={() => setStep(3)}
                />
              </View>
              {me?.whatsapp ? (
                <Text className="text-sm leading-5 text-muted-foreground">
                  {t("app.newOpportunity.whatsappNotice")}
                </Text>
              ) : (
                <Text className="text-sm leading-5 text-destructive">
                  {t("app.newOpportunity.whatsappMissing")}
                </Text>
              )}
              {publish.error ? (
                <Text className="text-sm text-destructive">
                  {publish.error instanceof Error
                    ? tv(publish.error.message)
                    : t("app.newOpportunity.publishError")}
                </Text>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        <View className="flex-row gap-3 border-t border-border-subtle bg-card p-4">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onPress={() => setStep(step - 1)}>
              <Text>{t("app.newOpportunity.back")}</Text>
            </Button>
          ) : null}
          <Button
            className="flex-1"
            disabled={!stepValid || publish.isPending}
            onPress={() => (last ? publish.mutate() : setStep(step + 1))}>
            <Text>{last ? (publish.isPending ? t("app.newOpportunity.publishing") : t("app.newOpportunity.publish")) : t("app.newOpportunity.continue")}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>

      <OptionSheet
        visible={sheet === 'category'}
        title={t("app.newOpportunity.stepService")}
        options={categoryOptions}
        value={form.category}
        allLabel={t("app.newOpportunity.chooseLater")}
        onSelect={(category) => update({ category })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'state'}
        title={t("app.newOpportunity.state")}
        options={STATE_OPTIONS}
        value={form.state}
        allLabel={t("app.newOpportunity.chooseLater")}
        onSelect={(state) => update({ state })}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
}

function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <View className="gap-1">
      <Text className="font-heading text-2xl font-bold">{title}</Text>
      {description ? <Text className="text-muted-foreground">{description}</Text> : null}
    </View>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <Text className="text-xs text-muted-foreground">{hint}</Text> : null}
    </View>
  );
}

function Summary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  const t = useT();
  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-semibold text-muted-foreground">{label}</Text>
        <Text>{value}</Text>
      </View>
      <Button variant="ghost" size="sm" onPress={onEdit} accessibilityLabel={t("app.newOpportunity.editAria", { label })}>
        <Text className="text-primary">{t("app.newOpportunity.edit")}</Text>
      </Button>
    </View>
  );
}

function ServiceOption({
  label,
  icon: Icon,
  selected,
  onPress,
}: {
  label: string;
  icon: ReturnType<typeof categoryIcon>;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={selected}
      accessibilityLabel={label}
      className="w-1/4 items-center gap-1.5 py-2 active:bg-accent">
      <View
        className={cn(
          'size-14 items-center justify-center',
          selected ? 'bg-primary' : 'bg-primary/10'
        )}>
        {selected ? (
          <Check size={24} className="text-primary-foreground" />
        ) : (
          <Icon size={24} className="text-primary" />
        )}
      </View>
      <Text
        className={cn('text-center text-xs font-medium', selected && 'text-primary')}
        numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
