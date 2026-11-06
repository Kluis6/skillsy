"use client";

// The plain Next router: this is the one place that changes the language, so
// the language-keeping router from @/lib/i18n/navigation doesn't apply.
// eslint-disable-next-line no-restricted-imports
import { useRouter as useNextRouter } from "next/navigation";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useLocale, useT } from "@/lib/i18n/provider";
import { usePathname } from "@/lib/i18n/navigation";
import { UserService } from "@/services/user-service";
import {
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  enabledLocales,
  type Locale,
} from "@skillsy/shared/i18n/locales";
import { localizedPath } from "@skillsy/shared/i18n/routing";
import { cn } from "@/lib/utils";

const ENABLED = enabledLocales(process.env.NEXT_PUBLIC_ENABLED_LOCALES);

/**
 * Language switcher (menu and footer). Saves the choice in the `lang` cookie,
 * which proxy.ts follows for links without a language, and, when signed in,
 * in users/{uid}.preferredLanguage, which decides the notifications received.
 * Hidden while only Portuguese is on.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useNextRouter();

  if (ENABLED.length < 2) return null;

  const choose = async (next: Locale) => {
    if (next === locale) return;
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    if (user) await UserService.setPreferredLanguage(user.uid, next).catch(() => {});
    // Read on click: useSearchParams would need a Suspense boundary on the
    // static pages that show the footer.
    router.push(`${localizedPath(pathname, next, DEFAULT_LOCALE)}${window.location.search}`);
  };

  return (
    <Select value={locale} onValueChange={(value) => value && choose(value as Locale)}>
      <SelectTrigger
        aria-label={t("language.choose")}
        className={cn("h-10 w-full gap-2 px-3 text-sm", className)}
      >
        <Languages className="size-4 text-text-muted" aria-hidden="true" />
        <SelectValue>{LOCALE_NAMES[locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ENABLED.map((item) => (
          <SelectItem key={item} value={item} lang={item}>
            {LOCALE_NAMES[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
