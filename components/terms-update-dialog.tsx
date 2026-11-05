"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { MINIMUM_AGE, TERMS_VERSION } from "@skillsy/shared/terms";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/user-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useT } from "@/lib/i18n/provider";
import { rich } from "@/lib/i18n/rich";

// Reading the documents must stay possible while the dialog is pending.
const LEGAL_PATHS = new Set(["/termos", "/privacidade", "/blocked"]);

/** Asks members who accepted an older version of the Terms of Use to accept
 * the current one (Termos de Uso, "Alterações destes termos"). */
export function TermsUpdateDialog() {
  const { user, profile } = useAuth();
  const t = useT();
  const pathname = usePathname();
  const [accepted, setAccepted] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pending =
    Boolean(user && profile) &&
    !profile?.isBlocked &&
    !profile?.isDeleted &&
    profile?.termsVersion !== TERMS_VERSION &&
    accepted !== user?.uid &&
    !LEGAL_PATHS.has(pathname);

  const accept = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await UserService.acceptCurrentTerms(user.uid);
      setAccepted(user.uid);
    } catch {
      toast.error(t("notices.termsAcceptError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={pending}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("notices.termsTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("notices.termsText", { age: MINIMUM_AGE })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm text-text-muted">
          {rich(t("notices.termsRead"), {
            terms: (
              <Link href="/termos" className="font-semibold text-primary hover:underline">
                {t("notices.termsOfUse")}
              </Link>
            ),
            privacy: (
              <Link href="/privacidade" className="font-semibold text-primary hover:underline">
                {t("notices.privacyPolicy")}
              </Link>
            ),
          })}
        </p>
        <AlertDialogFooter>
          <AlertDialogAction onClick={accept} disabled={saving}>
            {saving ? t("notices.saving") : t("notices.agree")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
