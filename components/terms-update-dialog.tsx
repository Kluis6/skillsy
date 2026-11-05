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

// Reading the documents must stay possible while the dialog is pending.
const LEGAL_PATHS = new Set(["/termos", "/privacidade", "/blocked"]);

/** Asks members who accepted an older version of the Terms of Use to accept
 * the current one (Termos de Uso, "Alterações destes termos"). */
export function TermsUpdateDialog() {
  const { user, profile } = useAuth();
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
      toast.error("Não foi possível registrar o aceite. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={pending}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Atualizamos os Termos de Uso e a Política de Privacidade</AlertDialogTitle>
          <AlertDialogDescription>
            Deixamos mais claro o papel da Skillsy, as responsabilidades de cada usuário, o
            tratamento dos dados de ala e ano de batismo e as regras de bloqueio. O uso continua
            gratuito, e o cadastro é permitido somente para maiores de {MINIMUM_AGE} anos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm text-text-muted">
          Leia os{" "}
          <Link href="/termos" className="font-semibold text-primary hover:underline">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="font-semibold text-primary hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <AlertDialogFooter>
          <AlertDialogAction onClick={accept} disabled={saving}>
            {saving ? "Salvando..." : "Li e concordo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
