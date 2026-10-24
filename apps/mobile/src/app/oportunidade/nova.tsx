import {
  OPPORTUNITY_FIELDS,
  OPPORTUNITY_URGENCIES,
  OPPORTUNITY_URGENCY,
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
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/lib/filters';
import { createOpportunity } from '@/lib/opportunities';
import { getOwnProfile } from '@/lib/providers';
import { cn } from '@/lib/utils';

const STEPS = ['Serviço', 'O que precisa', 'Onde', 'Urgência', 'Revisar'] as const;

const fits = (value: string, field: keyof typeof OPPORTUNITY_FIELDS) => {
  const { min, max } = OPPORTUNITY_FIELDS[field];
  const length = value.trim().length;
  return length >= min && length <= max;
};

/** Publishing in short steps, one decision per screen (like GetNinjas'
 * request flow), with the same limits the site and firestore.rules check. */
export default function NovaOportunidadeScreen() {
  const { user } = useAuth();
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
      showSnackbar(
        'Oportunidade publicada. Profissionais do mesmo serviço e estado serão avisados.'
      );
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
      <AppHeader title="Nova oportunidade" back />
      <View className="gap-2 bg-card px-4 pb-3 pt-3">
        <Text className="text-sm text-muted-foreground">
          Passo {step + 1} de {STEPS.length} · {STEPS[step]}
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
              <Heading title="Que serviço você precisa?" />
              <View className="flex-row flex-wrap">
                {POPULAR_CATEGORIES.map((category) => (
                  <ServiceOption
                    key={category}
                    label={category}
                    icon={categoryIcon(category)}
                    selected={form.category === category}
                    onPress={() => update({ category })}
                  />
                ))}
                <ServiceOption
                  label={
                    form.category && !POPULAR_CATEGORIES.includes(form.category as never)
                      ? form.category
                      : 'Outros serviços'
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
                title="Conte o que você precisa"
                description="Quanto mais detalhes, mais fácil para o profissional entender e responder."
              />
              <Field label="Título" hint={`${form.title.trim().length}/120`}>
                <Input
                  value={form.title}
                  onChangeText={(title) => update({ title })}
                  placeholder="Ex.: Instalar dois ventiladores de teto"
                  maxLength={120}
                />
              </Field>
              <Field
                label="Descrição"
                hint={
                  form.description.trim().length < 20
                    ? `Mínimo de 20 caracteres (${form.description.trim().length}/20)`
                    : `${form.description.trim().length}/2000`
                }>
                <Textarea
                  value={form.description}
                  onChangeText={(description) => update({ description })}
                  placeholder="O que precisa ser feito, detalhes importantes e quando você gostaria de fazer."
                  maxLength={2000}
                  textAlignVertical="top"
                />
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Heading
                title="Onde vai ser o serviço?"
                description="Os profissionais do mesmo estado são avisados."
              />
              <Field label="Estado">
                <View className="flex-row">
                  <Chip
                    label={stateLabel || 'Escolher estado'}
                    selected={Boolean(form.state)}
                    menu
                    onPress={() => setSheet('state')}
                  />
                </View>
              </Field>
              <Field label="Cidade">
                <Input
                  value={form.city}
                  onChangeText={(city) => update({ city })}
                  maxLength={100}
                />
              </Field>
              <Field label="Bairro">
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
              <Heading title="Qual a urgência?" />
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
                        {OPPORTUNITY_URGENCY[urgency].label}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {OPPORTUNITY_URGENCY[urgency].help}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Heading title="Revise antes de publicar" />
              <View className="gap-3 border border-border-subtle bg-card p-4">
                <Summary label="Serviço" value={form.category} onEdit={() => setStep(0)} />
                <Summary label="Título" value={form.title} onEdit={() => setStep(1)} />
                <Summary label="Descrição" value={form.description} onEdit={() => setStep(1)} />
                <Summary
                  label="Onde"
                  value={`${form.neighborhood}, ${form.city} · ${form.state}`}
                  onEdit={() => setStep(2)}
                />
                <Summary
                  label="Urgência"
                  value={OPPORTUNITY_URGENCY[form.urgency].label}
                  onEdit={() => setStep(3)}
                />
              </View>
              {me?.whatsapp ? (
                <Text className="text-sm leading-5 text-muted-foreground">
                  Seu WhatsApp aparece só como contato desta oportunidade. Ela fica ativa por 30
                  dias e você pode encerrar antes. Não substitui canais de emergência.
                </Text>
              ) : (
                <Text className="text-sm leading-5 text-destructive">
                  Cadastre um WhatsApp em Perfil → Editar perfil para os profissionais poderem
                  responder. Sem ele, não é possível publicar.
                </Text>
              )}
              {publish.error ? (
                <Text className="text-sm text-destructive">
                  {publish.error instanceof Error
                    ? publish.error.message
                    : 'Não foi possível publicar. Tente de novo.'}
                </Text>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        <View className="flex-row gap-3 border-t border-border-subtle bg-card p-4">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onPress={() => setStep(step - 1)}>
              <Text>Voltar</Text>
            </Button>
          ) : null}
          <Button
            className="flex-1"
            disabled={!stepValid || publish.isPending}
            onPress={() => (last ? publish.mutate() : setStep(step + 1))}>
            <Text>{last ? (publish.isPending ? 'Publicando…' : 'Publicar') : 'Continuar'}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>

      <OptionSheet
        visible={sheet === 'category'}
        title="Serviço"
        options={CATEGORY_OPTIONS}
        value={form.category}
        allLabel="Escolher depois"
        onSelect={(category) => update({ category })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'state'}
        title="Estado"
        options={STATE_OPTIONS}
        value={form.state}
        allLabel="Escolher depois"
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
  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-semibold text-muted-foreground">{label}</Text>
        <Text>{value}</Text>
      </View>
      <Button variant="ghost" size="sm" onPress={onEdit} accessibilityLabel={`Editar ${label}`}>
        <Text className="text-primary">Editar</Text>
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
