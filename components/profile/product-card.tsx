import Image from "next/image";
import type { ReactNode } from "react";
import type { Locale } from "@skillsy/shared/i18n/locales";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatProductPrice, productImageUrl, USE_STORAGE_EMULATOR, type ProductDetails } from "@/lib/product-catalog";
import { cn } from "@/lib/utils";

export function ProductCard({
  uid,
  product,
  locale,
  actions,
  rating,
  preview = false,
  heading: Heading = preview ? "h3" : "h2",
}: {
  uid: string;
  product: ProductDetails;
  locale: Locale;
  actions?: ReactNode;
  rating?: ReactNode;
  preview?: boolean;
  heading?: "h2" | "h3";
}) {
  return (
    <Card className={cn("h-full min-w-0 border border-border-subtle pt-0 ring-0", preview && "relative")}>
      <div className="relative h-30 shrink-0 bg-radial-[at_25%_25%] from-primary/70 to-primary">
        {product.imageName && (
          <Image
            src={productImageUrl(uid, product.imageName)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized={USE_STORAGE_EMULATOR}
            className="object-cover"
          />
        )}
      </div>
      <CardHeader className="gap-2">
        <CardTitle className="text-lg font-semibold text-text-main">
          <Heading className={cn("wrap-anywhere", preview && "line-clamp-2")}>
            {product.name}
          </Heading>
        </CardTitle>
        {rating}
        {product.priceCents !== undefined && (
          <p className="font-semibold tabular-nums text-primary">
            {formatProductPrice(product.priceCents, locale)}
          </p>
        )}
        <CardDescription className={cn("whitespace-pre-wrap wrap-anywhere", preview && "line-clamp-3")}>
          {product.description}
        </CardDescription>
      </CardHeader>
      {actions && <CardFooter className="mt-auto flex-wrap gap-2 border-border-subtle">{actions}</CardFooter>}
    </Card>
  );
}
