import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { nameInitial, providerRoleLabel } from '@skillsy/shared/format';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  BriefcaseBusiness,
  ChevronRight,
  ExternalLink,
  LogOut,
  Pencil,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { auth, usingEmulators } from '@/lib/firebase';
import { getOwnProfile } from '@/lib/providers';
import { openSite } from '@/lib/site';
import { cn } from '@/lib/utils';

function signInErrorMessage(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'E-mail ou senha incorretos.';
  }
  if (code === 'auth/invalid-email') return 'Confira o e-mail digitado.';
  if (code === 'auth/too-many-requests')
    return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (code === 'auth/network-request-failed') return 'Sem conexão. Confira sua internet.';
  return 'Não foi possível entrar. Tente de novo.';
}

export default function PerfilScreen() {
  const { user, loading } = useAuth();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="border-b border-border-subtle bg-card px-4 pb-3 pt-2">
        <Text className="font-heading text-2xl font-bold text-brand">Perfil</Text>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  const { data: me } = useQuery({ queryKey: ['me', uid], queryFn: () => getOwnProfile(uid) });
  const name = me?.name || fallbackName || 'Sua conta';

  const signOutAndClear = async () => {
    await signOut(auth);
    // Drop everything tied to the account (own profile, contacts, own posts).
    queryClient.removeQueries({ queryKey: ['me'] });
    queryClient.removeQueries({ queryKey: ['contacts'] });
    queryClient.removeQueries({ queryKey: ['my-opportunities'] });
    queryClient.removeQueries({ queryKey: ['recommended'] });
  };

  return (
    <>
      <View className="flex-row items-center gap-4 border border-border-subtle bg-card p-4">
        {me?.photoURL ? (
          <Image
            source={{ uri: me.photoURL }}
            style={{ width: 64, height: 64, borderRadius: 32 }}
            contentFit="cover"
          />
        ) : (
          <View className="size-16 items-center justify-center rounded-full bg-primary">
            <Text className="text-2xl font-bold text-primary-foreground">{nameInitial(name)}</Text>
          </View>
        )}
        <View className="flex-1 gap-0.5">
          <Text className="font-heading text-xl font-bold" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            {email}
          </Text>
          {me?.isProvider ? (
            <Text className="text-sm text-primary" numberOfLines={1}>
              {providerRoleLabel(me)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="border border-border-subtle bg-card">
        {me?.isProvider ? (
          <ListRow
            icon={User}
            label="Ver meu perfil público"
            onPress={() => router.push({ pathname: '/profissional/[id]', params: { id: uid } })}
          />
        ) : null}
        <ListRow
          icon={BriefcaseBusiness}
          label="Minhas oportunidades"
          onPress={() => router.navigate('/oportunidades')}
        />
        <ListRow
          icon={Pencil}
          label="Editar perfil no site"
          description="Foto, serviço, WhatsApp e galeria"
          external
          onPress={() => openSite('/profile')}
        />
        <ListRow icon={LogOut} label="Sair" destructive last onPress={signOutAndClear} />
      </View>
    </>
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
      setError(signInErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setError('Digite seu e-mail para receber o link de nova senha.');
      return;
    }
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Same message either way, so the form does not reveal which e-mails exist.
    }
    showSnackbar(
      'Se houver uma conta com esse e-mail, enviamos um link para criar uma nova senha.'
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Entrar</CardTitle>
          <CardDescription>Use o mesmo e-mail e senha da sua conta no site.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-1.5">
            <Label nativeID="email">E-mail</Label>
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
            <Label nativeID="password">Senha</Label>
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
            <Text>{submitting ? 'Entrando…' : 'Entrar'}</Text>
          </Button>
          <Button variant="ghost" onPress={resetPassword}>
            <Text className="text-primary">Esqueci minha senha</Text>
          </Button>
          {usingEmulators ? (
            <Text className="text-xs text-muted-foreground">
              Ambiente local: use o e-mail de uma conta real com a senha skillsy123.
            </Text>
          ) : null}
        </CardContent>
      </Card>

      <View className="gap-3 border border-border-subtle bg-card p-4">
        <Text className="font-semibold">Ainda não tem conta?</Text>
        <Text className="text-sm text-muted-foreground">
          Crie sua conta no site em menos de um minuto e depois entre aqui com o mesmo e-mail.
        </Text>
        <Button variant="outline" onPress={() => openSite('/signin')}>
          <ExternalLink size={16} className="text-foreground" />
          <Text>Criar conta no site</Text>
        </Button>
      </View>
    </>
  );
}
