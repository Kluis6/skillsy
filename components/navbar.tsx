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
import { LuLogIn } from "react-icons/lu";

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  logout: () => Promise<void>;
  activeTab: "explore" | "contacts";
  setActiveTab: (tab: "explore" | "contacts") => void;
}

export function Navbar({
  user: propUser,
  profile: propProfile,
  logout: propLogout,
}: Partial<NavbarProps>) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(false);

  const user = propUser !== undefined ? propUser : auth.user;
  const logout = propLogout !== undefined ? propLogout : auth.logout;
  const shouldShowBackButton =
    pathname === "/profile" || pathname?.startsWith("/profile/");

  const handleLogout = async () => {
    setMobileDrawerOpen(false);
    setDesktopDrawerOpen(false);
    await logout?.();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-[color-mix(in_oklab,var(--md-sys-color-surface)_86%,transparent)] backdrop-blur-md">
      <div className="container mx-auto flex min-h-16 items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          {shouldShowBackButton ? (
            <> </>
          ) : (
            <Drawer
              key={`mobile-drawer-${pathname}`}
              direction="left"
              open={mobileDrawerOpen}
              onOpenChange={setMobileDrawerOpen}
            >
              <DrawerTrigger asChild className="flex md:hidden">
                <Button
                  size="icon"
                  className="size-10"
                  variant="ghost"
                  aria-label="Abrir menu principal"
                >
                  <BsList className="size-[20px] text-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="flex flex-row justify-between">
                  <div className="flex flex-col">
                    <DrawerTitle className="text-cyan-800 dark:text-white text-base">
                      Skillsy
                    </DrawerTitle>
                    <DrawerDescription>
                      Onde talentos encontram oportunidades
                    </DrawerDescription>
                  </div>
                  <DrawerTrigger asChild>
                    <Button
                      size="icon"
                      className="bg-transparent hover:bg-primary/10"
                      aria-label="Fechar menu principal"
                    >
                      <BsXLg className="text-foreground" />
                    </Button>
                  </DrawerTrigger>
                </DrawerHeader>
                <div className="px-4 space-y-4">
                  <h3 className="font-medium text-sm text-foreground">
                    Navegação
                  </h3>
                  <ul className="w-full space-y-1">
                    <li className="rounded-full p-2 hover:bg-primary/10">
                      <DrawerClose asChild>
                        <Link
                          href="/"
                          className="flex text-sm font-normal text-text-muted"
                        >
                          Inicial
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="rounded-full p-2 hover:bg-primary/10">
                      <DrawerClose asChild>
                        <Link
                          href="/weareskillsy"
                          className="flex text-sm font-normal text-text-muted"
                        >
                          O que é Skillsy?
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="rounded-full p-2 hover:bg-primary/10">
                      <DrawerClose asChild>
                        <Link
                          href="/artigosevagas"
                          className="flex text-sm font-normal text-text-muted"
                        >
                          Novidades e vagas
                        </Link>
                      </DrawerClose>
                    </li>

                    <li className="rounded-full p-2 hover:bg-primary/10">
                      <DrawerClose asChild>
                        <Link
                          href="/join"
                          className="flex text-sm font-normal text-text-muted"
                        >
                          Por que participar?
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="rounded-full p-2 hover:bg-primary/10">
                      <DrawerClose asChild>
                        <Link
                          href="/privacidade"
                          className="flex text-sm font-normal text-text-muted"
                        >
                          Privacidade
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="rounded-full p-2 hover:bg-primary/10">
                      <DrawerClose asChild>
                        <Link
                          href="/termos"
                          className="flex text-sm font-normal text-text-muted"
                        >
                          Termos de uso
                        </Link>
                      </DrawerClose>
                    </li>
                  </ul>

                  {user && (
                    <>
                      <h3 className="font-medium text-sm text-foreground">
                        Minha conta
                      </h3>

                      <ul className="space-y-1">
                        <li className="rounded-full p-2 hover:bg-primary/10">
                          <DrawerClose asChild>
                            <Link
                              className="flex text-sm font-normal text-text-muted"
                              href="/contacts"
                            >
                              Meus Contatos
                            </Link>
                          </DrawerClose>
                        </li>
                        <li className="rounded-full p-2 hover:bg-primary/10">
                          <DrawerClose asChild>
                            <Link
                              className="flex text-sm font-normal text-text-muted"
                              href="/profile"
                            >
                              Configurações do Perfil
                            </Link>
                          </DrawerClose>
                        </li>
                        <li>
                          <Button
                            className="w-full justify-start px-3 text-sm font-normal text-text-muted"
                            onClick={handleLogout}
                          >
                            Sair da Conta
                          </Button>
                        </li>
                      </ul>
                    </>
                  )}
                </div>

                <DrawerFooter>
                  <DrawerClose asChild>
                    <Link
                      className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-center text-sm font-medium text-primary-foreground shadow-[var(--md-sys-elevation-level1)] hover:bg-primary/90 active:bg-primary/80"
                      href={"/donation"}
                    >
                      Ajude o projeto
                    </Link>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          {shouldShowBackButton ? (
            <></>
          ) : (
            <div className="md:flex hidden items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-semibold tracking-normal dark:text-white text-cyan-800">Skillsy</h1>
              </Link>
            </div>
          )}

          {shouldShowBackButton && (
            <Button
              variant="ghost"
              className="h-10 text-foreground"
              onClick={() => router.back()}
              aria-label="Voltar para a página anterior"
            >
              <ArrowLeft /> <p className="hidden md:flex">Voltar</p>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between w-auto gap-x-2">
          {shouldShowBackButton ? <></> : <ThemeToggle />}
          <Drawer
            key={`desktop-drawer-${pathname}`}
            direction="left"
            open={desktopDrawerOpen}
            onOpenChange={setDesktopDrawerOpen}
          >
            <DrawerTrigger asChild className="hidden md:flex">
              <Button
                size="icon"
                className="size-10"
                variant="ghost"
                aria-label="Abrir menu principal"
              >
                <BsList className="size-5 text-foreground" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <DrawerTitle className="text-cyan-800 dark:text-white">Skillsy</DrawerTitle>
                  <DrawerDescription>
                    Onde talentos encontram oportunidades
                  </DrawerDescription>
                </div>
                <DrawerTrigger asChild>
                  <Button
                    size="icon"
                    className="bg-transparent hover:bg-primary/10"
                    aria-label="Fechar menu principal"
                  >
                    <BsXLg className="text-foreground" />
                  </Button>
                </DrawerTrigger>
              </DrawerHeader>
              <div className="px-4 space-y-4">
                <h3 className="font-medium text-sm text-foreground">
                  Navegação
                </h3>
                <ul className="w-full space-y-1">
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose asChild>
                      <Link
                        href="/"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Inicial
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose asChild>
                      <Link
                        href="/weareskillsy"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        O que é Skillsy?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose asChild>
                      <Link
                        href="/artigosevagas"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Novidades e vagas
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose asChild>
                      <Link
                        href="/join"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Por que participar?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose asChild>
                      <Link
                        href="/privacidade"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Privacidade
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose asChild>
                      <Link
                        href="/termos"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Termos de uso
                      </Link>
                    </DrawerClose>
                  </li>
                </ul>

                {user && (
                  <>
                    <h3 className="font-medium text-sm text-foreground">
                      Minha conta
                    </h3>

                    <ul className="space-y-1">
                      <li className="rounded-full p-2 hover:bg-primary/10">
                        <DrawerClose asChild>
                          <Link
                            className="flex text-sm font-normal text-text-muted"
                            href="/contacts"
                          >
                            Meus Contatos
                          </Link>
                        </DrawerClose>
                      </li>
                      <li className="rounded-full p-2 hover:bg-primary/10">
                        <DrawerClose asChild>
                          <Link
                            className="flex text-sm font-normal text-text-muted"
                            href="/profile"
                          >
                            Configurações do Perfil
                          </Link>
                        </DrawerClose>
                      </li>
                      <li>
                        <Button
                          className="w-full justify-start px-3 text-sm font-normal text-text-muted"
                          onClick={handleLogout}
                        >
                          Sair da Conta
                        </Button>
                      </li>
                    </ul>
                  </>
                )}
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Link
                    className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-center text-sm font-medium text-primary-foreground shadow-[var(--md-sys-elevation-level1)] hover:bg-primary/90 active:bg-primary/80"
                    href={"/donation"}
                  >
                    Ajude o projeto
                  </Link>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {user ? (
            <Avatar className="size-7 ring-2 ring-offset-2 ring-offset-background ring-border-subtle md:ml-1.5 mr-1">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-6" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <AuthModal>
              <Button
              variant="default"
                title="Faça login ou cria sua conta"
                aria-label="Entrar ou criar conta"
                // className="bg-primary hover:bg-primary/90 active:bg-primary/80 w-10 md:w-auto md:px-4 h-10 dark:text-white font-normal"
              >
                <LuLogIn className="flex md:hidden size-4" />
                <p className="hidden font-medium md:block"> Entrar</p>
              </Button>
            </AuthModal>
          )}
        </div>
      </div>
    </nav>
  );
}
