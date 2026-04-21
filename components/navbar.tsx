"use client";

import { useState } from "react";
import { BsList, BsXLg } from "react-icons/bs";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}: Partial<NavbarProps>) {
  const auth = useAuth();
  const [internalTab, setInternalTab] = useState<"explore" | "contacts">(
    "explore",
  );

  const user = propUser !== undefined ? propUser : auth.user;
  const profile = propProfile !== undefined ? propProfile : auth.profile;
  const logout = propLogout !== undefined ? propLogout : auth.logout;
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalTab;
  const setActiveTab =
    propSetActiveTab !== undefined ? propSetActiveTab : setInternalTab;
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle ">
      <div className="container mx-auto flex justify-between items-center px-4 py-2.5">
        <div className="flex items-center space-x-4">
          <Drawer direction="left">
            <DrawerTrigger className="flex md:hidden">
              <Button size="icon" className="size-10" variant="ghost">
                <BsList className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row justify-between ">
                <div className="flex flex-col">
                  <DrawerTitle className="text-primary">Skillsy</DrawerTitle>
                  <DrawerDescription>
                    Onde talentos encontram oportunidades
                  </DrawerDescription>
                </div>
                <DrawerTrigger asChild>
                  <Button size="icon" className="bg-white hover:bg-zinc-100">
                    <BsXLg className="text-gray-800" />
                  </Button>
                </DrawerTrigger>
              </DrawerHeader>
              <div className="px-4 space-y-4">
                <h3 className="font-medium text-sm text-gray-800">Navegação</h3>
                <ul className="w-full space-y-1">
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/weareskillsy"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      O que é Skillsy?
                    </Link>
                  </li>
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/join"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      Por que participar?
                    </Link>
                  </li>
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/join"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      Privacidade
                    </Link>
                  </li>
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/termos"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      Termos de uso
                    </Link>
                  </li>
                </ul>

                {user && (
                  <>
                    <h3 className="font-medium text-sm text-gray-800">
                      Minha conta
                    </h3>

                    <ul className="space-y-1">
                      <li className="hover:bg-surface p-2">
                        <Link
                          className="flex text-sm font-normal text-gray-800"
                          href="/contacts"
                        >
                          Meus Contatos
                        </Link>
                      </li>
                      <li className="hover:bg-surface p-2">
                        <Link
                          className="flex text-sm font-normal text-gray-800"
                          href="/profile"
                        >
                          Configurações do Perfil
                        </Link>
                      </li>
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm px-2 h-9 hover:bg-surface font-normal text-gray-800 rounded-none"
                          onClick={logout}
                        >
                          Sair da Conta
                        </Button>
                      </li>
                    </ul>
                  </>
                )}
              </div>

              <DrawerFooter>
                <Link
                  className="text-center bg-primary p-2 font-medium text-sm text-white rounded-sm"
                  href={"/donation"}
                >
                  Ajude o projeto
                </Link>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="flex items-center gap-2">
            <Link href={"/"}>
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                Skillsy
              </h1>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ul className="hidden md:flex items-center text-sm font-semibold text-text-muted">
            <li>
              <Link
                href={"#"}
                className="text-sm font-normal text-gray-700 hover:text-gray-800 decoration-1 hover:underline transition-all underline-offset-2 decoration-gray-800"
              >
                O que é Skillsy
              </Link>
            </li>
          </ul>

          <Drawer direction="left">
            <DrawerTrigger className="hidden md:flex">
              <Button size="icon" className="size-10" variant="ghost">
                <BsList className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row justify-between ">
                <div className="flex flex-col">
                  <DrawerTitle className="text-primary">Skillsy</DrawerTitle>
                  <DrawerDescription>
                    Onde talentos encontram oportunidades
                  </DrawerDescription>
                </div>
                <DrawerTrigger asChild>
                  <Button size="icon" className="bg-white hover:bg-zinc-100">
                    <BsXLg className="text-gray-800" />
                  </Button>
                </DrawerTrigger>
              </DrawerHeader>
              <div className="px-4 space-y-4">
                <h3 className="font-medium text-sm text-gray-800">Navegação</h3>
                <ul className="w-full space-y-1">
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/weareskillsy"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      O que é Skillsy?
                    </Link>
                  </li>
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/join"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      Por que participar?
                    </Link>
                  </li>
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/join"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      Privacidade
                    </Link>
                  </li>
                  <li className=" p-2 hover:bg-surface">
                    <Link
                      href="/termos"
                      className="flex text-sm font-normal text-gray-800"
                    >
                      Termos de uso
                    </Link>
                  </li>
                </ul>

                {user && (
                  <>
                    <h3 className="font-medium text-sm text-gray-800">
                      Minha conta
                    </h3>

                    <ul className="space-y-1">
                      <li className="hover:bg-surface p-2">
                        <Link
                          className="flex text-sm font-normal text-gray-800"
                          href="/contacts"
                        >
                          Meus Contatos
                        </Link>
                      </li>
                      <li className="hover:bg-surface p-2">
                        <Link
                          className="flex text-sm font-normal text-gray-800"
                          href="/profile"
                        >
                          Configurações do Perfil
                        </Link>
                      </li>
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm px-2 h-9 hover:bg-surface font-normal text-gray-800 rounded-none"
                          onClick={logout}
                        >
                          Sair da Conta
                        </Button>
                      </li>
                    </ul>
                  </>
                )}
              </div>

              <DrawerFooter>
                <Link
                  className="text-center bg-primary p-2 font-medium text-sm text-white rounded-sm"
                  href={"/donation"}
                >
                  Ajude o projeto
                </Link>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Avatar className="size-9 ring-2 ring-offset-2 ring-zinc-400">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback>
                      <UserIcon className="size-9" />
                    </AvatarFallback>
                  </Avatar>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link
                      className="flex text-sm font-normal text-gray-800"
                      href="/contacts"
                    >
                      Meus Contatos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      className="flex text-sm font-normal text-gray-800"
                      href="/profile"
                    >
                      Configurações do Perfil
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={logout}>
                    Sair da conta
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthModal>
              <Button variant="default" className="bg-blue-600 px-4">
                Entrar
              </Button>
            </AuthModal>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
