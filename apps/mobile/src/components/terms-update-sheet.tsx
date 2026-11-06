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
import { useT } from '@/lib/i18n';

/** Same as the site's TermsUpdateDialog: members who accepted an older version
 * of the Terms of Use accept the current one. */
export function TermsUpdateSheet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const t = useT();
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
    onError: () => showSnackbar(t("app.terms.acceptError")),
  });

  const pending =
    Boolean(user && me) &&
    !me?.isBlocked &&
    !me?.isDeleted &&
    me?.termsVersion !== TERMS_VERSION &&
    !accept.isSuccess;

  return (
    <Sheet visible={pending} title={t("app.terms.title")} onClose={() => {}} dismissable={false}>
      <View className="gap-4 px-4 pb-4">
        <Text className="text-muted-foreground">
          {t("app.terms.text", { age: MINIMUM_AGE })}
        </Text>
        <View className="flex-row gap-card">
          <Button variant="outline" className="flex-1" onPress={() => openSite('/termos')}>
            <Text>{t("app.terms.terms")}</Text>
          </Button>
          <Button variant="outline" className="flex-1" onPress={() => openSite('/privacidade')}>
            <Text>{t("app.terms.privacy")}</Text>
          </Button>
        </View>
        <Button onPress={() => accept.mutate()} disabled={accept.isPending}>
          <Text>{accept.isPending ? t("app.terms.saving") : t('notices.agree')}</Text>
        </Button>
      </View>
    </Sheet>
  );
}
