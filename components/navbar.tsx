"use client";

import { useState } from "react";
import { BsList, BsXLg } from "react-icons/bs";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "@/components/auth-modal";
import { UserProfile } from "@/models/types";
import { User } from "firebase/auth";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { OpportunityNotifications } from "@/components/opportunity-notifications";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";
import type { MessageKey } from "@skillsy/shared/i18n/keys";

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  logout: () => Promise<void>;
  activeTab: "explore" | "contacts";
  setActiveTab: (tab: "explore" | "contacts") => void;
}

// Shared with the search page header so both menus use the same labels.
export const primaryNavItems = [
  { href: "/search", label: "nav.searchProfessional" },
  { href: "/encontrar-ajuda", label: "nav.whatDoYouNeed" },
  { href: "/oportunidades", label: "nav.opportunities" },
] as const satisfies readonly { href: string; label: MessageKey }[];

export const secondaryNavItems = [
  { href: "/", label: "nav.home" },
  { href: "/weareskillsy", label: "nav.whatIsSkillsy" },
  { href: "/artigosevagas", label: "nav.newsAndJobs" },
  { href: "/join", label: "nav.whyJoin" },
  { href: "/privacidade", label: "nav.privacy" },
  { href: "/termos", label: "nav.terms" },
] as const satisfies readonly { href: string; label: MessageKey }[];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Shared with the search page drawer.
export function DrawerLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <DrawerClose className="w-full">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-10 w-full items-center px-3 text-sm font-medium transition-colors border-s-4 border-transparent",
            active
              ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
              : "text-text-main hover:border-transparent hover:bg-muted dark:hover:bg-muted/50",
          )}
        >
          {label}
        </Link>
      </DrawerClose>
    </li>
  );
}

// Shared with the search page header.
export function DrawerNavigation({
  pathname,
  user,
  handleLogout,
}: {
  pathname: string | null;
  user: User | null;
  handleLogout: () => Promise<void>;
}) {
  const t = useT();
  return (
    <>
   
      <DrawerHeader className="flex flex-row justify-between">
        <div className="mb-4">
          <DrawerTitle className="text-base font-semibold normal-case text-text-main">
            {t("common.appName")}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-text-muted">
            {t("common.slogan")}
          </DrawerDescription>
        </div>

        <DrawerClose
          render={
            <Button
              size="icon-lg"
              variant="ghost"
              aria-label={t("nav.closeMenu")}
            >
              <BsXLg className="size-4 text-foreground" />
            </Button>
          }
        ></DrawerClose>
      </DrawerHeader>

      <div className="space-y-4 px-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-main">
            {t("nav.findWhatYouNeed")}
          </h3>
          <ul className="space-y-1">
            {primaryNavItems.map((item) => (
              <DrawerLink
                key={item.href}
                href={item.href}
                label={t(item.label)}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-main">
            {t("nav.aboutUs")}
          </h3>
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <DrawerLink
                key={item.href}
                href={item.href}
                label={t(item.label)}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </ul>
        </div>

        {user ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-main">
              {t("nav.myAccount")}
            </h3>
            <ul className="space-y-1">
              <DrawerLink
                href="/contacts"
                label={t("nav.myContacts")}
                active={isActivePath(pathname, "/contacts")}
              />
              <DrawerLink
                href="/profile"
                label={t("nav.profileSettings")}
                active={isActivePath(pathname, "/profile")}
              />
              <li className="mb-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium px-3 h-10 text-sm text-text-main normal-case"
                  onClick={handleLogout}
                >
                  {t("common.signOut")}
                </Button>
              </li>
            </ul>
          </div>
        ) : null}
      </div>

      <DrawerFooter>
        <DrawerClose>
          <Link
            className="flex h-10 items-center justify-center bg-primary text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
            href="/donation"
          >
            {t("nav.supportProject")}
          </Link>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function Navbar({
  user: propUser,
  profile: propProfile,
  logout: propLogout,
}: Partial<NavbarProps>) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const t = useT();

  const user = propUser !== undefined ? propUser : auth.user;
  const profile = propProfile !== undefined ? propProfile : auth.profile;
  const logout = propLogout !== undefined ? propLogout : auth.logout;
  const shouldShowBackButton =
    pathname === "/profile" || pathname?.startsWith("/profile/");

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout?.();
  };

  return (
    <nav className="sticky w-full top-0 z-50 border-b border-border-subtle bg-card/85 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {shouldShowBackButton ? (
            <Button
              variant="ghost"
              className="text-foreground"
              onClick={() => router.back()}
              aria-label={t("common.backAria")}
            >
              <ArrowLeft className="size-5 text-foreground" />
              <span className="hidden md:inline">{t("common.back")}</span>
            </Button>
          ) : (
            <Drawer
              swipeDirection="left"
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
            >
              <DrawerTrigger
                aria-label={t("nav.openMenu")}
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                    aria-label={t("nav.openMenu")}
                  >
                    <BsList className="size-4 text-text-main" />
                  </Button>
                }
              />

              <DrawerContent className="w-screen">
                <DrawerNavigation
                  pathname={pathname}
                  user={user}
                  handleLogout={handleLogout}
                />
              </DrawerContent>
            </Drawer>
          )}

          {!shouldShowBackButton ? (
            <Link href="/" className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-normal text-brand">
                {t("common.appName")}
              </h1>
            </Link>
          ) : null}

          {/* Main sections stay visible on large screens; the drawer keeps the rest. */}
          {!shouldShowBackButton ? (
            <div className="hidden items-center gap-1 lg:flex">
              {primaryNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-text-muted hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
                    )}
                  >
                    {t(item.label)}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between space-x-2">
          {!shouldShowBackButton ? <ThemeToggle /> : null}
          {user && !shouldShowBackButton ? <OpportunityNotifications /> : null}

          {!shouldShowBackButton ? (
            <Drawer swipeDirection="left">
              <DrawerTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hidden md:flex"
                    aria-label={t("nav.openMenu")}
                  >
                    <BsList className="size-4 text-text-main" />
                  </Button>
                }
              ></DrawerTrigger>
              <DrawerContent>
                <DrawerNavigation
                  pathname={pathname}
                  user={user}
                  handleLogout={handleLogout}
                />
              </DrawerContent>
            </Drawer>
          ) : null}

          {user ? (
            <Avatar className="size-10">
              <AvatarImage src={profile?.photoURL || user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <AuthModal>
              <Button
                variant="default"
                title={t("nav.signInTitle")}
                aria-label={t("nav.signInAria")}
                className="px-3 normal-case lg:px-6"
              >
                <span className="font-medium">{t("common.signIn")}</span>
              </Button>
            </AuthModal>
          )}
        </div>
      </div>
    </nav>
  );
}
