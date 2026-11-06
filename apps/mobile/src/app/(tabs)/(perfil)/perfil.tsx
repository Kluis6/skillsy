import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';
import { router } from 'expo-router';
import {
  BookUser,
  BriefcaseBusiness,
  ChevronRight,
  ExternalLink,
  FileText,
  LogOut,
  Newspaper,
  Pencil,
  ShieldCheck,
  User,
  type LucideIcon,
} from '@/lib/icons';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';

import { ProfileAvatar } from '@/components/profile-avatar';
import { AppHeader } from '@/components/app-header';
import { AppearancePicker } from '@/components/appearance-picker';
import { LanguagePicker } from '@/components/language-picker';
import { HTML_LANG } from '@skillsy/shared/i18n/locales';
import type { TranslateFn } from '@skillsy/shared/i18n/keys';
import { GoogleButton } from '@/components/google-button';
import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { auth, usingEmulators } from '@/lib/firebase';
import { signInWithGoogle, signOutOfGoogle } from '@/lib/google-sign-in';
import { unregisterDevice } from '@/lib/push';
import { getOwnProfile } from '@/lib/providers';
import { openSite } from '@/lib/site';
import { MINIMUM_AGE } from '@skillsy/shared/terms';
import { cn } from '@/lib/utils';
import { useFormat, useLocale, useT } from '@/lib/i18n';

function signInErrorMessage(error: unknown, t: TranslateFn) {
  const code = error instanceof FirebaseError ? error.code : '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return t("app.profile.wrongCredentials");
  }
  if (code === 'auth/invalid-email') return t("app.profile.checkEmail");
  if (code === 'auth/too-many-requests')
    return t("app.profile.tooMany");
  if (code === 'auth/network-request-failed') return t("app.profile.offline");
  return t("app.profile.signInError");
}

export default function PerfilScreen() {
  const { user, loading } = useAuth();
  const t = useT();

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={user ? t("app.profile.title") : t("app.profile.signInTitle")} />
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView contentContainerClassName="gap-card p-4" keyboardShouldPersistTaps="handled">
          {loading ? (
            <ActivityIndicator className="mt-8" />
          ) : user ? (
            <Account
              uid={user.uid}
              email={user.email ?? ''}
              fallbackName={user.displayName ?? ''}
            />
          ) : (
            <SignInForm />
          )}
          {loading ? null : <AppearancePicker />}
          {loading ? null : <LanguagePicker />}
          {loading ? null : <LegalLinks />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Account({
  uid,
  email,
  fallbackName,
}: {
  uid: string;
  email: string;
  fallbackName: string;
}) {
  const queryClient = useQueryClient();
  const t = useT();
  const format = useFormat();
  const { data: me } = useQuery({ queryKey: ['me', uid], queryFn: () => getOwnProfile(uid) });
  const name = me?.name || fallbackName || t("app.profile.yourAccount");

  const signOutAndClear = async () => {
    // This phone stops getting the account's notifications.
    await unregisterDevice();
    await Promise.all([signOut(auth), signOutOfGoogle()]);
    // Drop everything tied to the account (own profile, contacts, own posts).
    queryClient.removeQueries({ queryKey: ['me'] });
    queryClient.removeQueries({ queryKey: ['contacts'] });
    queryClient.removeQueries({ queryKey: ['my-opportunities'] });
    queryClient.removeQueries({ queryKey: ['recommended'] });
    queryClient.removeQueries({ queryKey: ['my-posts'] });
    queryClient.removeQueries({ queryKey: ['admin-posts'] });
  };

  return (
    <>
      <View className="flex-row items-center gap-4 border border-border-subtle bg-card p-4">
        <ProfileAvatar uri={me?.photoURL} name={name} className="size-16" iconSize={28} />
        <View className="flex-1 gap-0.5">
          <Text className="font-heading text-xl font-bold" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            {email}
          </Text>
          {me?.isProvider ? (
            <Text className="text-sm text-primary" numberOfLines={1}>
              {format.role(me)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="border border-border-subtle bg-card">
        {me?.isProvider ? (
          <ListRow
            icon={User}
            label={t("app.profile.viewPublic")}
            onPress={() => router.push({ pathname: '/profissional/[id]', params: { id: uid } })}
          />
        ) : null}
        <ListRow icon={BookUser} label={t("app.profile.contacts")} onPress={() => router.push('/contatos')} />
        <ListRow
          icon={BriefcaseBusiness}
          label={t("app.profile.opportunities")}
          onPress={() => router.navigate('/oportunidades')}
        />
        <ListRow
          icon={Newspaper}
          label={t("app.profile.posts")}
          description={t("app.profile.postsText")}
          onPress={() => router.push('/meus-artigos')}
        />
        {me?.role === 'admin' ? (
          <ListRow
            icon={ShieldCheck}
            label={t("app.profile.moderate")}
            description={t("app.profile.moderateText")}
            onPress={() => router.push('/moderar-artigos')}
          />
        ) : null}
        <ListRow
          icon={Pencil}
          label={t("app.profile.edit")}
          description={t("app.profile.editText")}
          onPress={() => router.push('/editar-perfil')}
        />
        <ListRow icon={LogOut} label={t("app.profile.signOut")} destructive last onPress={signOutAndClear} />
      </View>
    </>
  );
}

/** Terms and privacy, on the site (signed in or not). */
function LegalLinks() {
  const t = useT();
  return (
    <View className="border border-border-subtle bg-card">
      <ListRow icon={FileText} label={t("app.profile.terms")} external onPress={() => openSite('/termos')} />
      <ListRow
        icon={ShieldCheck}
        label={t("app.profile.privacy")}
        external
        last
        onPress={() => openSite('/privacidade')}
      />
    </View>
  );
}

function ListRow({
  icon: Icon,
  label,
  description,
  external,
  destructive,
  last,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  external?: boolean;
  destructive?: boolean;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={external ? 'link' : 'button'}
      className={cn(
        'min-h-14 flex-row items-center gap-4 px-4 py-3 active:bg-accent',
        !last && 'border-b border-border-subtle'
      )}>
      <Icon size={20} className={destructive ? 'text-destructive' : 'text-muted-foreground'} />
      <View className="flex-1">
        <Text className={cn('text-base', destructive && 'text-destructive')}>{label}</Text>
        {description ? <Text className="text-sm text-muted-foreground">{description}</Text> : null}
      </View>
      {destructive ? null : external ? (
        <ExternalLink size={18} className="text-muted-foreground" />
      ) : (
        <ChevronRight size={18} className="text-muted-foreground" />
      )}
    </Pressable>
  );
}

function SignInForm() {
  const showSnackbar = useSnackbar();
  const t = useT();
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(signInErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const google = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      setError(t("app.profile.googleError"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setError(t("app.profile.resetNeedsEmail"));
      return;
    }
    setError('');
    try {
      // The e-mail goes out in the app's language.
      auth.languageCode = HTML_LANG[locale];
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Same message either way, so the form does not reveal which e-mails exist.
    }
        showSnackbar(t("app.profile.resetSent"));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t("app.profile.accessTitle")}</CardTitle>
          <CardDescription>{t("app.profile.accessText")}</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <GoogleButton onPress={google} disabled={submitting} />
          <Text className="text-xs leading-5 text-muted-foreground">
            {t("app.profile.consentStart", { age: MINIMUM_AGE })}{' '}
            <Text
              className="text-xs font-semibold text-primary"
              onPress={() => openSite('/termos')}>
                            {t("app.profile.terms")}
            </Text>{' '}
            {t("app.profile.and")}{' '}
            <Text
              className="text-xs font-semibold text-primary"
              onPress={() => openSite('/privacidade')}>
                            {t("app.profile.privacy")}
            </Text>
            .
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-sm text-muted-foreground">{t("app.profile.or")}</Text>
            <View className="h-px flex-1 bg-border" />
          </View>
          <View className="gap-1.5">
            <Label nativeID="email">{t("app.profile.email")}</Label>
            <Input
              aria-labelledby="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          </View>
          <View className="gap-1.5">
            <Label nativeID="password">{t("app.profile.password")}</Label>
            <Input
              aria-labelledby="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
            />
          </View>
          {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
          <Button onPress={submit} disabled={submitting || !email || !password}>
            <Text>{submitting ? t("app.profile.signingIn") : t("app.profile.signInTitle")}</Text>
          </Button>
          <Button variant="ghost" onPress={resetPassword}>
            <Text className="text-primary">{t("app.profile.forgot")}</Text>
          </Button>
          {usingEmulators ? (
            <Text className="text-xs text-muted-foreground">
              {t("app.profile.emulatorHint")}
            </Text>
          ) : null}
        </CardContent>
      </Card>

      <View className="gap-3 border border-border-subtle bg-card p-4">
        <Text className="font-semibold">{t("app.profile.noAccount")}</Text>
        <Text className="text-sm text-muted-foreground">
          {t("app.profile.noAccountText")}
        </Text>
        <Button variant="outline" onPress={() => openSite('/signin')}>
          <ExternalLink size={16} className="text-foreground" />
          <Text>{t("app.profile.createOnSite")}</Text>
        </Button>
      </View>
    </>
  );
}
