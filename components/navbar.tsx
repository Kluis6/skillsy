"use client";

import { useState } from "react";
import { BsBoxArrowInRight, BsList, BsXLg } from "react-icons/bs";
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
      <DrawerClose className="w-full">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-10 w-full items-center px-3 text-sm font-medium transition-colors",
            active
              ? " text-white bg-primary/80 dark:bg-primary/80 "
              : "text-gray-700 hover:bg-secondary/40  dark:hover:bg-surface",
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
        <div className=" mb-4">
          <DrawerTitle className="dark:text-white text-base normal-case font-semibold">
            Skillsy
          </DrawerTitle>
          <DrawerDescription className="text-sm text-gray-500 dark:text-gray-50">
            Onde talentos encontram oportunidades
          </DrawerDescription>
        </div>

        <DrawerClose
          render={
            <Button
              size="icon"
              variant="ghost"
              aria-label="Fechar menu principal"
            >
              <BsXLg className="size-5 text-foreground" />
            </Button>
          }
        ></DrawerClose>
      </DrawerHeader>

      <div className="space-y-4 px-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-50">
            Encontre o que você precisa
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
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-50">
            Quem somos
          </h3>
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
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-50">
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
              <li className="mb-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium px-3 text-sm text-gray-700 normal-case"
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
        <DrawerClose>
          <Link
            className="flex h-10 items-center justify-center  bg-primary  text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
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
      <div className="container mx-auto flex  items-center justify-between gap-4 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {shouldShowBackButton ? (
            <Button
              variant="ghost"
              className="text-foreground"
              onClick={() => router.back()}
              aria-label="Voltar para a página anterior"
            >
              <ArrowLeft className="size-5 text-foreground" />
              <span className="hidden md:inline">Voltar</span>
            </Button>
          ) : (
            <Drawer
              swipeDirection="left"
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
            >
              <DrawerTrigger
                aria-label="Abrir menu principal"
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                    aria-label="Abrir menu principal"
                  >
                    <BsList className="size-5 text-foreground " />
                  </Button>
                }
              />

              <DrawerContent className="w-[94vw]">
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

          {/* {!shouldShowBackButton ? (
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
          ) : null} */}
        </div>

        <div className="flex items-center justify-between gap-2">
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
                    aria-label="Abrir menu principal"
                  >
                    <BsList className="size-5 text-foreground" />
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
            <Avatar className="size-9">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <AuthModal>
              <Button
                variant="default"
                size="sm"
                title="Faça login ou crie sua conta"
                aria-label="Entrar ou criar conta"
                className="w-10 md:w-auto h-10 normal-case"
              >
                <BsBoxArrowInRight className="block size-5 md:hidden" />
                <span className="hidden  font-medium md:block">Entrar</span>
              </Button>
            </AuthModal>
          )}
        </div>
      </div>
    </nav>
  );
}
