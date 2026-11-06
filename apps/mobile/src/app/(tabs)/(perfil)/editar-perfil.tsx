import {
  AVAILABILITY_OPTIONS,
  profileToFormValues,
  toProfileUpdatePayload,
  type MembershipType,
  type ProfileFormValues,
} from '@skillsy/shared/profile-form';
import { profileSchema } from '@skillsy/shared/validations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Camera, ImagePlus, Trash2 } from '@/lib/icons';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileAvatar } from '@/components/profile-avatar';
import { AppHeader } from '@/components/app-header';
import { Chip } from '@/components/chip';
import { OptionSheet } from '@/components/option-sheet';
import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { openSite } from '@/lib/site';
import { STATE_OPTIONS, useCategoryOptions } from '@/lib/filters';
import { pickImage, uploadImage, type ImageKind } from '@/lib/image-upload';
import { saveProfile } from '@/lib/profile';
import { getOwnProfile } from '@/lib/providers';
import { cn } from '@/lib/utils';
import { useLabels, useT, useValidationMessage } from '@/lib/i18n';

type Errors = Partial<Record<keyof ProfileFormValues, string>>;

/** "Cidade, UF" (the site's location format) split into its two fields. */
function splitLocation(location: string) {
  const parts = location.split(',').map((part) => part.trim());
  const last = parts.at(-1) ?? '';
  return /^[A-Z]{2}$/i.test(last) && parts.length > 1
    ? { city: parts.slice(0, -1).join(', '), state: last.toUpperCase() }
    : { city: location.trim(), state: '' };
}

/** Edit the signed-in member's profile, with the site's form rules
 * (profileSchema) and the same documents (saveProfile → @skillsy/shared). */
export default function EditarPerfilScreen() {
  const { user } = useAuth();
  const t = useT();
  const { data: me, isPending } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title={t("app.editProfile.title")} back />
      {isPending || !me ? (
        <ActivityIndicator className="mt-12" />
      ) : (
        // Mounted once the profile is loaded, so the form starts filled in.
        <ProfileForm initial={profileToFormValues(me)} />
      )}
    </SafeAreaView>
  );
}

function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const { user } = useAuth();
  const t = useT();
  const tv = useValidationMessage();
  const labels = useLabels();
  const categoryOptions = useCategoryOptions();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const [values, setValues] = useState(initial);
  const [location, setLocation] = useState(() => splitLocation(initial.location));
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState<ImageKind | null>(null);
  const [sheet, setSheet] = useState<'category' | 'state' | null>(null);

  const update = (patch: Partial<ProfileFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key as keyof ProfileFormValues];
      return next;
    });
  };

  // The form values the site would save: location as "Cidade, UF", and for
  // professionals the state also in businessState (what opportunity alerts use).
  const formValues: ProfileFormValues = {
    ...values,
    location: [location.city.trim(), location.state].filter(Boolean).join(', '),
    businessState: values.isProvider && location.state ? location.state : values.businessState,
  };
  const dirty = JSON.stringify(formValues) !== JSON.stringify(initial);

  const save = useMutation({
    mutationFn: () => saveProfile(user!, toProfileUpdatePayload(formValues)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      showSnackbar(t("app.editProfile.saved"));
      if (router.canGoBack()) router.back();
    },
    onError: (error) => {
      console.error('Falha ao salvar o perfil:', error);
      showSnackbar(t("app.editProfile.saveError"));
    },
  });

  const submit = () => {
    const result = profileSchema.safeParse(formValues);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProfileFormValues;
        next[field] ??= tv(issue.message);
      }
      setErrors(next);
      showSnackbar(t("app.editProfile.reviewFields"));
      return;
    }
    save.mutate();
  };

  const changeImage = async (kind: 'avatar' | 'banner' | 'gallery') => {
    const asset = await pickImage(kind);
    if (!asset) return;
    setUploading(kind);
    try {
      const url = await uploadImage(asset, kind);
      if (kind === 'avatar') update({ photoURL: url });
      else if (kind === 'banner') update({ bannerURL: url });
      else update({ gallery: [...values.gallery, { url, description: '' }] });
    } catch {
      showSnackbar(t("app.editProfile.uploadError"));
    } finally {
      setUploading(null);
    }
  };

  const stateLabel = STATE_OPTIONS.find((option) => option.value === location.state)?.label;

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView contentContainerClassName="gap-card p-4 pb-8" keyboardShouldPersistTaps="handled">
        <Section title={t("app.editProfile.photos")}>
          <Pressable
            onPress={() => changeImage('banner')}
            accessibilityRole="button"
            accessibilityLabel={t("app.editProfile.changeCover")}
            className="overflow-hidden active:opacity-80">
            {values.bannerURL ? (
              <Image
                source={{ uri: values.bannerURL }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                contentFit="cover"
              />
            ) : (
              <View className="aspect-video w-full items-center justify-center bg-primary">
                <ImagePlus size={28} className="text-primary-foreground" />
              </View>
            )}
            <UploadBadge busy={uploading === 'banner'} label={t("app.editProfile.changeCover")} />
          </Pressable>
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={() => changeImage('avatar')}
              accessibilityRole="button"
              accessibilityLabel={t("app.editProfile.changePhotoAria")}>
              <ProfileAvatar
                uri={values.photoURL}
                name={values.name}
                className="size-20"
                iconSize={32}
              />
            </Pressable>
            <Button
              variant="outline"
              className="flex-1"
              disabled={uploading === 'avatar'}
              onPress={() => changeImage('avatar')}>
              <Camera size={16} className="text-foreground" />
              <Text>{uploading === 'avatar' ? t("app.editProfile.uploading") : t("app.editProfile.changePhoto")}</Text>
            </Button>
          </View>
        </Section>

        <Section title={t("app.editProfile.aboutYou")}>
          <Field label={t("app.editProfile.name")} error={errors.name}>
            <Input value={values.name} onChangeText={(name) => update({ name })} maxLength={50} />
          </Field>
          <Field
            label={t("app.editProfile.about")}
            hint={t("app.editProfile.aboutHint", { count: values.bio.length })}
            error={errors.bio}>
            <Textarea
              value={values.bio}
              onChangeText={(bio) => update({ bio })}
              maxLength={500}
              textAlignVertical="top"
            />
          </Field>
          <Field label={t("app.editProfile.city")} error={errors.location}>
            <Input
              value={location.city}
              onChangeText={(city) => setLocation((current) => ({ ...current, city }))}
              maxLength={90}
            />
          </Field>
          <Field label={t("app.editProfile.state")}>
            <View className="flex-row">
              <Chip
                label={stateLabel || t("app.editProfile.chooseState")}
                selected={Boolean(location.state)}
                menu
                onPress={() => setSheet('state')}
              />
            </View>
          </Field>
        </Section>

        <Section title={t("app.editProfile.contact")}>
          <Field
            label="WhatsApp"
            hint={t("app.editProfile.whatsappHint")}
            error={errors.whatsapp}>
            <Input
              value={values.whatsapp}
              onChangeText={(whatsapp) => update({ whatsapp: whatsapp.replace(/\D/g, '') })}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </Field>
          <Field label={t("app.editProfile.phone")} error={errors.phone}>
            <Input
              value={values.phone}
              onChangeText={(phone) => update({ phone: phone.replace(/\D/g, '') })}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </Field>
          <Field label="Instagram" error={errors.instagram}>
            <Input
              value={values.instagram}
              onChangeText={(instagram) => update({ instagram })}
              autoCapitalize="none"
              placeholder={t("app.editProfile.instagramPlaceholder")}
              maxLength={50}
            />
          </Field>
          <Field label={t("app.editProfile.website")} error={errors.website}>
            <Input
              value={values.website}
              onChangeText={(website) => update({ website })}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://"
              maxLength={150}
            />
          </Field>
        </Section>

        <Section title={t("app.editProfile.community")}>
          <View className="flex-row flex-wrap gap-2">
            {(
              [
                ['member', t('app.editProfile.member')],
                ['friend', t('app.editProfile.friend')],
              ] as [MembershipType, string][]
            ).map(([value, label]) => (
              <Chip
                key={value}
                label={label}
                selected={values.membershipType === value}
                onPress={() =>
                  update({ membershipType: values.membershipType === value ? '' : value })
                }
              />
            ))}
          </View>
          {values.membershipType === 'member' ? (
            <>
              <Field label={t("app.editProfile.ward")} error={errors.ward}>
                <Input
                  value={values.ward}
                  onChangeText={(ward) => update({ ward })}
                  maxLength={100}
                />
              </Field>
              <Field
                label={t("app.editProfile.baptismYear")}
                hint={t("app.editProfile.baptismHint")}
                error={errors.baptismYear}>
                <Input
                  value={values.baptismYear}
                  onChangeText={(baptismYear) =>
                    update({ baptismYear: baptismYear.replace(/\D/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </Field>
              {/* LGPD art. 11: specific consent for religious data. */}
              <Text className="text-xs leading-5 text-muted-foreground">
                {t("app.editProfile.consentStart")}{' '}
                <Text
                  className="text-xs font-semibold text-primary"
                  onPress={() => openSite('/termos#dados-de-filiacao-religiosa')}>
                                    {t("app.editProfile.termsLink")}
                </Text>
                {t("app.editProfile.consentEnd")}
              </Text>
            </>
          ) : null}
        </Section>

        <Section title={t("app.editProfile.advertiseSection")}>
          <Pressable
            onPress={() => update({ isProvider: !values.isProvider })}
            accessibilityRole="switch"
            aria-checked={values.isProvider}
            className="flex-row items-center gap-4">
            <View className="flex-1 gap-0.5">
              <Text className="font-semibold">{t("app.editProfile.advertise")}</Text>
              <Text className="text-sm text-muted-foreground">
                {t("app.editProfile.advertiseText")}
              </Text>
            </View>
            <Switch
              checked={values.isProvider}
              onCheckedChange={(isProvider) => update({ isProvider })}
            />
          </Pressable>
          {values.isProvider ? (
            <>
              <Field label={t("app.editProfile.service")} error={errors.category}>
                <View className="flex-row">
                  <Chip
                    label={values.category ? labels.category(values.category) : t("app.editProfile.chooseService")}
                    selected={Boolean(values.category)}
                    menu
                    onPress={() => setSheet('category')}
                  />
                </View>
              </Field>
              <Field
                label={t("app.editProfile.profession")}
                hint={t("app.editProfile.professionHint")}
                error={errors.serviceType}>
                <Input
                  value={values.serviceType}
                  onChangeText={(serviceType) => update({ serviceType })}
                  maxLength={100}
                />
              </Field>
              <Field label={t("app.editProfile.company")} error={errors.companyName}>
                <Input
                  value={values.companyName}
                  onChangeText={(companyName) => update({ companyName })}
                  maxLength={100}
                />
              </Field>
              <Field label={t("app.editProfile.days")}>
                <View className="flex-row flex-wrap gap-2">
                  {AVAILABILITY_OPTIONS.map((day) => {
                    const selected = values.availability.includes(day);
                    return (
                      <Chip
                        key={day}
                        label={labels.day(day)}
                        selected={selected}
                        onPress={() =>
                          update({
                            availability: selected
                              ? values.availability.filter((item) => item !== day)
                              : AVAILABILITY_OPTIONS.filter(
                                  (item) => item === day || values.availability.includes(item)
                                ),
                          })
                        }
                      />
                    );
                  })}
                </View>
              </Field>
              <Field
                label={t("app.editProfile.hours")}
                hint={t("app.editProfile.hoursHint")}
                error={errors.serviceHours}>
                <Input
                  value={values.serviceHours}
                  onChangeText={(serviceHours) => update({ serviceHours })}
                  maxLength={100}
                />
              </Field>
            </>
          ) : null}
        </Section>

        <Section title={t("app.editProfile.gallery", { count: values.gallery.length })}>
          {values.gallery.map((item, index) => (
            <View key={item.url} className="flex-row gap-3">
              <Image
                source={{ uri: item.url }}
                style={{ width: 96, height: 72 }}
                contentFit="cover"
              />
              <View className="flex-1 gap-2">
                <Input
                  value={item.description}
                  onChangeText={(description) =>
                    update({
                      gallery: values.gallery.map((photo, i) =>
                        i === index ? { ...photo, description } : photo
                      ),
                    })
                  }
                  placeholder={t("app.editProfile.photoDescription")}
                  maxLength={200}
                />
              </View>
              <Pressable
                onPress={() => update({ gallery: values.gallery.filter((_, i) => i !== index) })}
                accessibilityRole="button"
                accessibilityLabel={t("app.editProfile.removePhoto")}
                className="size-12 items-center justify-center active:bg-accent">
                <Trash2 size={18} className="text-destructive" />
              </Pressable>
            </View>
          ))}
          {values.gallery.length < 5 ? (
            <Button
              variant="outline"
              disabled={uploading === 'gallery'}
              onPress={() => changeImage('gallery')}>
              <ImagePlus size={16} className="text-foreground" />
              <Text>{uploading === 'gallery' ? t("app.editProfile.uploading") : t("app.editProfile.addPhoto")}</Text>
            </Button>
          ) : null}
        </Section>
      </ScrollView>

      <View className="border-t border-border bg-card p-4">
        <Button disabled={!dirty || save.isPending || uploading !== null} onPress={submit}>
          <Text>{save.isPending ? t("app.editProfile.saving") : t("app.editProfile.save")}</Text>
        </Button>
      </View>

      <OptionSheet
        visible={sheet === 'category'}
        title={t("app.editProfile.service")}
        options={categoryOptions}
        value={values.category}
        allLabel={t("app.editProfile.chooseLater")}
        onSelect={(category) => update({ category: category as ProfileFormValues['category'] })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'state'}
        title={t("app.editProfile.state")}
        options={STATE_OPTIONS}
        value={location.state}
        allLabel={t("app.editProfile.chooseLater")}
        onSelect={(state) => setLocation((current) => ({ ...current, state }))}
        onClose={() => setSheet(null)}
      />
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4 border border-border-subtle bg-card p-4">
      <Text className="font-heading text-lg font-semibold">{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}

function UploadBadge({ busy, label }: { busy: boolean; label: string }) {
  const t = useT();
  return (
    <View
      className={cn(
        'absolute bottom-2 right-2 flex-row items-center gap-1.5 bg-black/60 px-3 py-1.5',
        busy && 'bg-black/80'
      )}>
      <Camera size={14} className="text-white" />
      <Text className="text-xs font-medium text-white">{busy ? t("app.editProfile.uploading") : label}</Text>
    </View>
  );
}
