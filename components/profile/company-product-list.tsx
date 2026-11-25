"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PublicProductGrid } from "@/components/profile/public-product-grid";
import { Button } from "@/components/ui/button";
import { useLocale, useT } from "@/lib/i18n/provider";
import { COMPANY_PRODUCT_PAGE_SIZE, type PublicCatalogPage } from "@/lib/product-catalog";
import { ProductService } from "@/services/product-service";

export function CompanyProductList({ uid, contactHref, initialPage }: {
  uid: string;
  contactHref: string | null;
  initialPage: PublicCatalogPage;
}) {
  const t = useT();
  const locale = useLocale();
  const [products, setProducts] = useState(initialPage.items);
  const [hasMore, setHasMore] = useState(initialPage.nextCursor !== null);
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const cursor = useRef(initialPage.nextCursor);
  const pending = useRef(false);
  const trigger = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (cursor.current === null || pending.current) return;
    pending.current = true;
    setStatus("loading");

    try {
      const page = await ProductService.listPublicPage(uid, COMPANY_PRODUCT_PAGE_SIZE, cursor.current);
      cursor.current = page.nextCursor;
      setProducts((items) => [...items, ...page.items]);
      setHasMore(page.nextCursor !== null);
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }, [uid]);

  useEffect(() => {
    if (!hasMore || status !== "ready" || !trigger.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        observer.disconnect();
        void loadMore();
      }
    }, { rootMargin: "0px 0px 160px" });
    observer.observe(trigger.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore, status]);

  return (
    <>
      <div aria-busy={status === "loading"}>
        <PublicProductGrid products={products} uid={uid} hasCompany locale={locale} contactHref={contactHref} t={t} />
      </div>
      {hasMore && (
        <div ref={trigger} className="flex flex-col items-center gap-2">
          {status === "error" && <p role="alert" className="text-sm text-text-muted">{t("products.loadError")}</p>}
          <Button variant="outline" onClick={() => void loadMore()} disabled={status === "loading"} aria-live="polite">
            {t(status === "error" ? "products.retry" : status === "loading" ? "products.loadingMore" : "products.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}
