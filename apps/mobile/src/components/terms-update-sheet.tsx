import { MINIMUM_AGE, TERMS_VERSION } from '@skillsy/shared/terms';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { getOwnProfile } from '@/lib/providers';
import { openSite } from '@/lib/site';

/** Same as the site's TermsUpdateDialog: members who accepted an older version
 * of the Terms of Use accept the current one. */
export function TermsUpdateSheet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });

  const accept = useMutation({
    // firestore.rules only accept termsAcceptedAt = request.time.
    mutationFn: () =>
      updateDoc(doc(db, 'users', user!.uid), {
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: serverTimestamp(),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
    onError: () => showSnackbar('Não foi possível registrar o aceite. Tente de novo.'),
  });

  const pending =
    Boolean(user && me) &&
    !me?.isBlocked &&
    !me?.isDeleted &&
    me?.termsVersion !== TERMS_VERSION &&
    !accept.isSuccess;

  return (
    <Sheet visible={pending} title="Termos atualizados" onClose={() => {}} dismissable={false}>
      <View className="gap-4 px-4 pb-4">
        <Text className="text-muted-foreground">
          Atualizamos os Termos de Uso e a Política de Privacidade. Deixamos mais claro o papel da
          Skillsy, as responsabilidades de cada usuário, o tratamento dos dados de ala e ano de
          batismo e as regras de bloqueio. O uso continua gratuito, e o cadastro é permitido somente
          para maiores de {MINIMUM_AGE} anos.
        </Text>
        <View className="flex-row gap-card">
          <Button variant="outline" className="flex-1" onPress={() => openSite('/termos')}>
            <Text>Termos de uso</Text>
          </Button>
          <Button variant="outline" className="flex-1" onPress={() => openSite('/privacidade')}>
            <Text>Privacidade</Text>
          </Button>
        </View>
        <Button onPress={() => accept.mutate()} disabled={accept.isPending}>
          <Text>{accept.isPending ? 'Salvando…' : 'Li e concordo'}</Text>
        </Button>
      </View>
    </Sheet>
  );
}
