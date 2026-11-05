import { Button } from '@/components/ui/button';
import { SearchSlash, Home } from 'lucide-react';
import Link from '@/lib/i18n/navigation';
import type { TranslateFn } from '@skillsy/shared/i18n/keys';

/** `t` comes from the caller: global-not-found renders outside app/[lang],
 * where there is no I18nProvider. */
export function NotFoundPage({ t }: { t: TranslateFn }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-center">
      <div className="w-24 h-24 bg-primary/5 text-primary flex items-center justify-center mb-8 rotate-3">
        <SearchSlash size={48} />
      </div>
      
      <h1 className="text-4xl font-bold text-text-main mb-4 font-heading tracking-tight">{t("errors.notFoundTitle")}</h1>
      <p className="text-text-muted max-w-sm mb-12 leading-relaxed text-lg">
        {t("errors.notFoundText")}
      </p>

      <Button
        render={<Link href="/" />}
        nativeButton={false}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-14 text-lg font-bold group"
      >
        <Home size={22} className="mr-3 group-hover:-translate-y-0.5 transition-transform" />
        {t("errors.goHome")}
      </Button>
      
      <div className="mt-16 flex gap-8">
        <div className="flex flex-col items-center opacity-50">
          <span className="text-3xl font-bold font-heading">404</span>
          <span className="text-xs font-bold">{t("errors.pageCode")}</span>
        </div>
      </div>
    </div>
  );
}
