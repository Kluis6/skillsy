'use client';

import NextLink from 'next/link';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from 'next/navigation';
import { useMemo, type ComponentProps } from 'react';
import { LOCALES } from '@skillsy/shared/i18n/locales';
import { useHref } from './provider';

// Language-aware versions of next/link and next/navigation. Links and
// navigations keep the current language ("/search" → "/en/search" on English
// pages; nothing changes in Portuguese), and usePathname returns the path
// without the language, so comparisons like pathname === "/profile" keep
// working on every language.

type LinkProps = ComponentProps<typeof NextLink>;

/** next/link that adds the current language to internal paths. */
export default function Link({ href, ...props }: LinkProps) {
  const localize = useHref();
  return <NextLink href={typeof href === 'string' && href.startsWith('/') ? localize(href) : href} {...props} />;
}

export function useRouter() {
  const router = useNextRouter();
  const localize = useHref();
  return useMemo(() => {
    const fix = (href: string) => (href.startsWith('/') ? localize(href) : href);
    return {
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(fix(href), options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(fix(href), options),
      prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(fix(href), options),
    };
  }, [router, localize]);
}

/** Current path without the language prefix ("/en/search" → "/search"). */
export function usePathname() {
  const pathname = useNextPathname();
  return stripLocale(pathname);
}

export function stripLocale(pathname: string) {
  const first = pathname.split('/')[1];
  if (!(LOCALES as readonly string[]).includes(first)) return pathname;
  return pathname.slice(first.length + 1) || '/';
}
