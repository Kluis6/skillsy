import { signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { auth, usingEmulators } from '@/lib/firebase';

function signInErrorMessage(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'E-mail ou senha incorretos.';
  }
  if (code === 'auth/invalid-email') return 'Confira o e-mail digitado.';
  if (code === 'auth/too-many-requests') return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (code === 'auth/network-request-failed') return 'Sem conexão. Confira sua internet.';
  return 'Não foi possível entrar. Tente de novo.';
}

export default function PerfilScreen() {
  const { user, loading } = useAuth();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
          <Text className="text-2xl font-bold text-brand">Skillsy</Text>
          {loading ? (
            <ActivityIndicator className="mt-8" />
          ) : user ? (
            <SignedIn email={user.email ?? ''} name={user.displayName ?? ''} />
          ) : (
            <SignInForm />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignedIn({ email, name }: { email: string; name: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name || 'Sua conta'}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent className="gap-3">
        <Text className="text-sm text-muted-foreground">
          A edição do perfil chega nas próximas versões do app.
        </Text>
        <Button variant="outline" onPress={() => signOut(auth)}>
          <Text>Sair</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

function SignInForm() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
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
        {usingEmulators ? (
          <Text className="text-xs text-muted-foreground">
            Ambiente local: use o e-mail de uma conta real com a senha skillsy123.
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
