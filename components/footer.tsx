"use client";

import Link from "@/lib/i18n/navigation";
import { openCookiePreferences } from "@/lib/cookie-consent";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-border-subtle bg-card py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between  gap-4 w-full">
          <h4 className="font-bold text-text-main tracking-tight order-1">{t("common.appName")}</h4>

          <div className="order-2 lg:order-3 flex flex-col md:flex-row gap-4 lg:gap-6 text-text-muted items-start">
            <Link
              href="/artigosevagas"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              {t("footer.newsAndJobs")}
            </Link>
            <Link
              href="/join"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              {t("footer.join")}
            </Link>
            <Link
              href="/termos"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              {t("footer.privacy")}
            </Link>
            <LanguageSwitcher className="h-8 w-auto" />
            <Button
              type="button"
              variant="link"
              onClick={openCookiePreferences}
              className="h-auto p-0 text-sm font-normal text-text-muted no-underline hover:text-primary hover:no-underline"
            >
              {t("footer.cookies")}
            </Button>
          </div>
          <p className="order-3 lg:order-2 text-text-muted text-center text-xs md:text-left">
            © {new Date().getFullYear()} <strong>{t("common.appName")}</strong>. {t("footer.madeFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}
