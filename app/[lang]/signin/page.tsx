import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
import { createPrivateMetadata } from "@/lib/public-metadata";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t("auth.signInMetaTitle"),
    description: t("auth.signInMetaDescription"),
  });
}

export default async function Page({ searchParams }: PageProps<"/[lang]/signin">) {
  const { tab } = await searchParams;
  return <AuthPage defaultTab={tab === "login" ? "login" : "signup"} />;
}
