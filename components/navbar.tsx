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
import { MdLogin } from "react-icons/md";
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

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  logout: () => Promise<void>;
  activeTab: "explore" | "contacts";
  setActiveTab: (tab: "explore" | "contacts") => void;
}

const primaryNavItems = [
  { href: "/search", label: "Buscar profissional" },
  { href: "/encontrar-ajuda", label: "Pedir ajuda" },
  { href: "/oportunidades", label: "Pedidos abertos" },
] as const;

const secondaryNavItems = [
  { href: "/", label: "Inicial" },
  { href: "/weareskillsy", label: "O que é Skillsy?" },
  { href: "/artigosevagas", label: "Novidades e vagas" },
  { href: "/join", label: "Por que participar?" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de uso" },
] as const;

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DrawerLink({
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
      <DrawerClose asChild>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "text-text-muted hover:bg-primary/10 hover:text-primary",
          )}
        >
          {label}
        </Link>
      </DrawerClose>
    </li>
  );
}

function DrawerNavigation({
  pathname,
  user,
  handleLogout,
}: {
  pathname: string | null;
  user: User | null;
  handleLogout: () => Promise<void>;
}) {
  return (
    <>
      <DrawerHeader className="flex flex-row justify-between">
        <div className="flex flex-col">
          <DrawerTitle className="font-heading text-base text-primary dark:text-white">
            Skillsy
          </DrawerTitle>
          <DrawerDescription>
            Encontre pessoas, pedidos e oportunidades da comunidade.
          </DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Fechar menu principal"
          >
            <BsXLg className="size-4 text-foreground" />
          </Button>
        </DrawerClose>
      </DrawerHeader>

      <div className="space-y-5 px-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Caminhos principais
          </h3>
          <ul className="space-y-1">
            {primaryNavItems.map((item) => (
              <DrawerLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Mais</h3>
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <DrawerLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </ul>
        </div>

        {user ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Minha conta
            </h3>
            <ul className="space-y-1">
              <DrawerLink
                href="/contacts"
                label="Meus contatos"
                active={isActivePath(pathname, "/contacts")}
              />
              <DrawerLink
                href="/profile"
                label="Configurações do perfil"
                active={isActivePath(pathname, "/profile")}
              />
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 text-sm font-medium text-text-muted"
                  onClick={handleLogout}
                >
                  Sair da conta
                </Button>
              </li>
            </ul>
          </div>
        ) : null}
      </div>

      <DrawerFooter>
        <DrawerClose asChild>
          <Link
            className="flex min-h-10 items-center justify-center rounded-md bg-primary px-5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
            href="/donation"
          >
            Ajude o projeto
          </Link>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function Navbar({
  user: propUser,
  logout: propLogout,
}: Partial<NavbarProps>) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = propUser !== undefined ? propUser : auth.user;
  const logout = propLogout !== undefined ? propLogout : auth.logout;
  const shouldShowBackButton =
    pathname === "/profile" || pathname?.startsWith("/profile/");

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout?.();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-[color-mix(in_oklab,var(--skillsy-color-surface)_86%,transparent)] backdrop-blur-md">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-4 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {shouldShowBackButton ? (
            <Button
              variant="ghost"
              className="text-foreground"
              onClick={() => router.back()}
              aria-label="Voltar para a página anterior"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden md:inline">Voltar</span>
            </Button>
          ) : (
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="md:hidden"
                  aria-label="Abrir menu principal"
                >
                  <BsList className="size-5 text-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
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
              <h1 className="font-heading text-2xl font-semibold tracking-normal text-primary dark:text-white">
                Skillsy
              </h1>
            </Link>
          ) : null}

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
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-text-muted hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          {!shouldShowBackButton ? <ThemeToggle /> : null}
          {user && !shouldShowBackButton ? <OpportunityNotifications /> : null}

          {!shouldShowBackButton ? (
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hidden md:flex lg:hidden"
                  aria-label="Abrir menu principal"
                >
                  <BsList className="size-5 text-foreground" />
                </Button>
              </DrawerTrigger>
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
            <Avatar className="size-8 ring-2 ring-offset-2 ring-offset-background ring-border-subtle md:ml-1.5">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <AuthModal>
              <Button
                variant="default"
                title="Faça login ou crie sua conta"
                aria-label="Entrar ou criar conta"
              >
                <MdLogin className="flex size-4 md:hidden" />
                <span className="hidden font-medium md:block">Entrar</span>
              </Button>
            </AuthModal>
          )}
        </div>
      </div>
    </nav>
  );
}
