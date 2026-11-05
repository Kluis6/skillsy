import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
import { createPrivateMetadata } from "@/lib/public-metadata";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t("auth.recoveryMetaTitle"),
    description: t("auth.recoveryMetaDescription"),
  });
}

export default function Page() {
  return <AuthPage defaultTab="login" />;
}
