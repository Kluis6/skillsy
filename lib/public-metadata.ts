import type { Metadata } from "next";
import type { OgHeroImage } from "@/lib/og-image-templates";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  OG_LOCALE,
  enabledLocales,
  type Locale,
} from "@skillsy/shared/i18n/locales";
import { localizedPath } from "@skillsy/shared/i18n/routing";
import { getLocale } from "@/lib/i18n/server";

const ENABLED_LOCALES = enabledLocales(process.env.NEXT_PUBLIC_ENABLED_LOCALES);

/**
 * canonical, hreflang alternates and og:locale for a path in the page's
 * language. `path` is the Portuguese one ("/termos"); the others get their
 * prefix ("/en/termos"). With only Portuguese on, there are no alternates.
 */
export function localizedAlternates(path: string, locale: Locale) {
  const canonical = localizedPath(path, locale, DEFAULT_LOCALE);
  const languages =
    ENABLED_LOCALES.length > 1
      ? {
          ...Object.fromEntries(
            ENABLED_LOCALES.map((item) => [HTML_LANG[item], localizedPath(path, item, DEFAULT_LOCALE)]),
          ),
          "x-default": path,
        }
      : undefined;
  return { canonical, languages, ogLocale: OG_LOCALE[locale] };
}

// Canonical host: skillsy.com.br redirects (307) to www, so URLs built from
// this (og:image, canonical, sitemap) must use www to avoid the extra hop.
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.skillsy.com.br";
const siteName = "Skillsy";

type PublicMetadataOptions = {
  title: string;
  description: string;
  path: string;
  imageTitle?: string;
  imageDescription?: string;
  imageLabel?: string;
  /** The page's hero image, shown behind the text of its share thumbnail.
   * Omit for pages without one: the default blue background is used. */
  heroImage?: OgHeroImage;
  /** The route has its own opengraph-image file (home, profiles, posts):
   * leave the image tags to Next, which publishes the correct URL for it.
   * Don't hardcode that URL — on dynamic routes Next adds a suffix to it. */
  useRouteOgImage?: boolean;
  openGraphType?: "website" | "article";
  keywords?: string[];
};

type PrivateMetadataOptions = {
  title: string;
  description?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

function createOgImageUrl({
  title,
  description,
  label,
  heroImage,
}: {
  title: string;
  description: string;
  label?: string;
  heroImage?: OgHeroImage;
}) {
  const params = new URLSearchParams({
    title,
    description,
  });

  if (label) {
    params.set("label", label);
  }

  if (heroImage) {
    params.set("hero", heroImage);
  }

  return `/api/og?${params.toString()}`;
}

export async function createPublicMetadata({
  title,
  description,
  path,
  imageTitle,
  imageDescription,
  imageLabel,
  heroImage,
  useRouteOgImage,
  openGraphType,
  keywords,
}: PublicMetadataOptions): Promise<Metadata> {
  const alternates = localizedAlternates(path, await getLocale());
  const socialImage = useRouteOgImage
    ? undefined
    : createOgImageUrl({
        title: imageTitle ?? title,
        description: imageDescription ?? description,
        label: imageLabel,
        heroImage,
      });

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: alternates.canonical,
      ...(alternates.languages ? { languages: alternates.languages } : {}),
    },
    openGraph: {
      type: openGraphType ?? "website",
      locale: alternates.ogLocale,
      url: alternates.canonical,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      ...(socialImage
        ? {
            images: [
              {
                url: socialImage,
                width: 1200,
                height: 630,
                alt: `${title} | ${siteName}`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}

export function getPublicBaseUrl() {
  return normalizeBaseUrl(baseUrl);
}

export function createPrivateMetadata({
  title,
  description,
}: PrivateMetadataOptions): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

/**
 * Public profile data for pages everyone receives: the ward is only shown to
 * signed-in members, so it never goes into the server-rendered page.
 */
export function withoutWard<T extends { ward?: string }>(profile: T): T {
  return { ...profile, ward: undefined };
}
