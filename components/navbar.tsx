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
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle dark:border-slate-800">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-4">
          {shouldShowBackButton ? (
            <></>
          ) : (
            <Drawer
              key={`mobile-drawer-${pathname}`}
              direction="left"
              open={mobileDrawerOpen}
              onOpenChange={setMobileDrawerOpen}
            >
              <DrawerTrigger asChild className="flex md:hidden">
                <Button size="icon" className="size-10" variant="ghost">
                  <BsList className="size-5 text-gray-700 dark:text-white" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="flex flex-row justify-between">
                  <div className="flex flex-col">
                    <DrawerTitle className="text-primary text-base">
                      Skillsy
                    </DrawerTitle>
                    <DrawerDescription>
                      Onde talentos encontram oportunidades
                    </DrawerDescription>
                  </div>
                  <DrawerTrigger asChild>
                    <Button
                      size="icon"
                      className="bg-white dark:bg-accent dark:hover:bg-black/45 hover:bg-zinc-100"
                    >
                      <BsXLg className="text-gray-800 dark:text-white" />
                    </Button>
                  </DrawerTrigger>
                </DrawerHeader>
                <div className="px-4 space-y-4">
                  <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                    Navegação
                  </h3>
                  <ul className="w-full space-y-1">
                    <li className="p-2 hover:bg-surface">
                      <DrawerClose asChild>
                        <Link
                          href="/"
                          className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                        >
                          Inicial
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="p-2 hover:bg-surface">
                      <DrawerClose asChild>
                        <Link
                          href="/weareskillsy"
                          className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                        >
                          O que é Skillsy?
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="p-2 hover:bg-surface">
                      <DrawerClose asChild>
                        <Link
                          href="/noticias"
                          className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                        >
                          Novidades e notícias
                        </Link>
                      </DrawerClose>
                    </li>

                    <li className="p-2 hover:bg-surface">
                      <DrawerClose asChild>
                        <Link
                          href="/join"
                          className="flex text-sm font-normal  text-gray-700 dark:text-gray-50"
                        >
                          Por que participar?
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="p-2 hover:bg-surface">
                      <DrawerClose asChild>
                        <Link
                          href="/privacidade"
                          className="flex text-sm font-normal  text-gray-700 dark:text-gray-50"
                        >
                          Privacidade
                        </Link>
                      </DrawerClose>
                    </li>
                    <li className="p-2 hover:bg-surface">
                      <DrawerClose asChild>
                        <Link
                          href="/termos"
                          className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                        >
                          Termos de uso
                        </Link>
                      </DrawerClose>
                    </li>
                  </ul>

                  {user && (
                    <>
                      <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                        Minha conta
                      </h3>

                      <ul className="space-y-1">
                        <li className="hover:bg-surface p-2">
                          <DrawerClose asChild>
                            <Link
                              className="flex text-sm font-normal  text-gray-700 dark:text-gray-50"
                              href="/contacts"
                            >
                              Meus Contatos
                            </Link>
                          </DrawerClose>
                        </li>
                        <li className="hover:bg-surface p-2">
                          <DrawerClose asChild>
                            <Link
                              className="flex text-sm font-normal  text-gray-700 dark:text-gray-50"
                              href="/profile"
                            >
                              Configurações do Perfil
                            </Link>
                          </DrawerClose>
                        </li>
                        <li>
                          <Button
                            className="w-full justify-start text-sm px-2 h-9 hover:bg-surface font-normal text-gray-700 dark:text-gray-50 rounded-none bg-transparent"
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
                      className="text-center bg-primary hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 black:active:bg-blue-800 p-2 font-medium text-sm text-white rounded-md"
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
              <Link
                href="/weareskillsy"
                className="text-sm font-normal text-gray-700 hover:text-gray-800 decoration-1 hover:underline transition-all underline-offset-2 decoration-gray-800 dark:decoration-white dark:text-white"
              >
                O que é Skillsy
              </Link>
            </div>
          )}

          {shouldShowBackButton && (
            <Button
              variant="ghost"
              className="h-10 text-gray-700 dark:text-white"
              onClick={() => router.back()}
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
              <Button size="icon" className="size-10" variant="ghost">
                <BsList className="size-5 text-gray-700 dark:text-white" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <DrawerTitle className="text-primary">Skillsy</DrawerTitle>
                  <DrawerDescription>
                    Onde talentos encontram oportunidades
                  </DrawerDescription>
                </div>
                <DrawerTrigger asChild>
                  <Button
                    size="icon"
                    className="bg-white dark:bg-accent dark:hover:bg-black/45 hover:bg-zinc-100"
                  >
                    <BsXLg className="text-gray-800 dark:text-white" />
                  </Button>
                </DrawerTrigger>
              </DrawerHeader>
              <div className="px-4 space-y-4">
                <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                  Navegação
                </h3>
                <ul className="w-full space-y-1">
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/"
                        className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                      >
                        Inicial
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/weareskillsy"
                        className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                      >
                        O que é Skillsy?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/noticias"
                        className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                      >
                        Novidades e notícias
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/join"
                        className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                      >
                        Por que participar?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/privacidade"
                        className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                      >
                        Privacidade
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/termos"
                        className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                      >
                        Termos de uso
                      </Link>
                    </DrawerClose>
                  </li>
                </ul>

                {user && (
                  <>
                    <h3 className="font-medium text-sm text-gray-800 dark:text-white">
                      Minha conta
                    </h3>

                    <ul className="space-y-1">
                      <li className="hover:bg-surface p-2">
                        <DrawerClose asChild>
                          <Link
                            className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                            href="/contacts"
                          >
                            Meus Contatos
                          </Link>
                        </DrawerClose>
                      </li>
                      <li className="hover:bg-surface p-2">
                        <DrawerClose asChild>
                          <Link
                            className="flex text-sm font-normal text-gray-700 dark:text-gray-50"
                            href="/profile"
                          >
                            Configurações do Perfil
                          </Link>
                        </DrawerClose>
                      </li>
                      <li>
                        <Button
                          className="w-full justify-start text-sm px-2 h-9 hover:bg-surface font-normal text-gray-700 dark:text-gray-50 rounded-none bg-transparent"
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
                    className="text-center bg-primary hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 black:active:bg-blue-800 p-2 font-medium text-sm text-white rounded-md"
                    href={"/donation"}
                  >
                    Ajude o projeto
                  </Link>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {user ? (
            <Avatar className="size-7 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black dark:ring-slate-700 ring-slate-400 md:ml-1.5 mr-1">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-7" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <AuthModal>
              <Button
                title="Faça login ou cria sua conta"
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 w-10 md:w-auto md:px-4 h-10 dark:text-white font-normal"
              >
                <LuLogIn />
                <p className="hidden md:block"> Entrar</p>
              </Button>
            </AuthModal>
          )}
        </div>
      </div>
    </nav>
  );
}
