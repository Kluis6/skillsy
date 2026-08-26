"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProviderProfileCard } from "@/components/profile/provider-profile-card";
import {
  Search,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

import { AuthModal } from "./auth-modal";
import { BRAZIL_STATES } from "@/lib/brazil-states";
import {
  BsBoxArrowInRight,
  BsList,
  BsSearch,
  BsSliders2,
  BsXLg,
} from "react-icons/bs";
import { cn } from "@/lib/utils";

import {
  Drawer,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { LuLogIn } from "react-icons/lu";
import { Footer } from "./footer";
import { MdLogin, MdSearch } from "react-icons/md";
import { PROVIDER_CATEGORIES } from "@/lib/profile-form";
import { User } from "firebase/auth";
import { ThemeToggle } from "./theme-toggle";
import { OpportunityNotifications } from "./opportunity-notifications";

interface SearchClientProps {
  initialQuery: string;
  initialCity: string;
  initialState: string;
  initialCategory: string;
  initialResults: UserProfile[];
  initialSuggestions: UserProfile[];
}

const primaryNavItems = [
  { href: "/search", label: "Buscar profissional" },
  { href: "/encontrar-ajuda", label: "Pedir ajuda" },
  { href: "/oportunidades", label: "Oportunidades" },
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

function SearchDrawerLink({
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
              ? " text-primary dark:text-white dark:border-cyan-500 border-primary hover:bg-cyan-700/10 "
              : "text-gray-700 dark:text-gray-50 hover:border-transparent hover:bg-neutral-500/10 ",
          )}
        >
          {label}
        </Link>
      </DrawerClose>
    </li>
  );
}

function SearchDrawerNavigation({
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
        <div className="mb-4">
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
              size="icon-lg"
              variant="ghost"
              aria-label="Fechar menu principal"
            >
              <BsXLg className="size-4 text-foreground" />
            </Button>
          }
        />
      </DrawerHeader>

      <div className="space-y-4 px-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-50">
            Encontre o que você precisa
          </h3>
          <ul className="space-y-1">
            {primaryNavItems.map((item) => (
              <SearchDrawerLink
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
              <SearchDrawerLink
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
              <SearchDrawerLink
                href="/contacts"
                label="Meus contatos"
                active={isActivePath(pathname, "/contacts")}
              />
              <SearchDrawerLink
                href="/profile"
                label="Configurações do perfil"
                active={isActivePath(pathname, "/profile")}
              />
              <li className="mb-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start dark:text-white font-medium px-3 h-10 text-sm text-gray-700 normal-case"
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
            className="flex h-10 items-center justify-center bg-primary text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
            href="/donation"
          >
            Ajude o projeto
          </Link>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function SearchClient({
  initialQuery,
  initialCity,
  initialState,
  initialCategory,
  initialResults,
  initialSuggestions,
}: SearchClientProps) {
  const { profile } = useAuth();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const query = initialQuery;
  const city = initialCity;
  const state = initialState;
  const logout = auth.logout;
  const user = auth.user;

  const selectedStateLabel =
    BRAZIL_STATES.find((item) => item.value === state)?.label || state;

  const [searchTerm, setSearchTerm] = useState(query);
  const selectedCategory = initialCategory || null;
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const hasRouteFilters = Boolean(query || city || state || selectedCategory);
  const hasActiveFilters = hasRouteFilters || Boolean(selectedCategory);
  const activeLocationLabel = city
    ? `${city}, ${selectedStateLabel || state}`
    : state
      ? selectedStateLabel
      : null;

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, city, state, selectedCategory]);

  const results = initialResults;

  const paginatedResults = useMemo(
    () =>
      results.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [currentPage, results],
  );

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const createRouteParams = (overrides?: {
    q?: string | null;
    city?: string | null;
    state?: string | null;
    category?: string | null;
  }) => {
    const params = new URLSearchParams();
    const nextQuery = overrides?.q ?? query;
    const nextCity = overrides?.city ?? city;
    const nextState = overrides?.state ?? state;
    const nextCategory = overrides?.category ?? selectedCategory;

    if (nextQuery?.trim()) {
      params.set("q", nextQuery.trim());
    }

    if (nextState?.trim()) {
      params.set("state", nextState.trim());
    }

    if (nextCity?.trim()) {
      params.set("city", nextCity.trim());
    }
    if (nextCategory?.trim()) {
      params.set("category", nextCategory.trim());
    }

    return params;
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = createRouteParams({
      q: searchTerm.trim() || null,
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleStateChange = (selectedState: string) => {
    const params = createRouteParams();

    if (selectedState === "all") {
      params.delete("state");
      params.delete("city");
    } else {
      params.set("state", selectedState);
      if (selectedState !== state) {
        params.delete("city");
      }
    }

    router.push(`/search?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    router.push("/search");
  };

  const clearSearchQuery = () => {
    setSearchTerm("");
    const params = createRouteParams({ q: null });
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (nextCategory: string | null) => {
    const params = createRouteParams({ category: nextCategory });
    router.push(`/search?${params.toString()}`);
  };

  const handleLogout = async () => {
    setMobileDrawerOpen(false);
    await logout?.();
  };

  const renderCategoryFilter = (id: string) => (
    <Select
      value={selectedCategory || "all"}
      onValueChange={(value) =>
        handleCategoryChange(value === "all" ? null : value)
      }
    >
      <SelectTrigger id={id} className="h-12 w-full  px-3 text-sm">
        <SelectValue>{selectedCategory || "Todas as categorias"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as categorias</SelectItem>
        {PROVIDER_CATEGORIES.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen bg-surface/30 w-full space-y-2">
      <nav className="sticky w-full top-0 z-50 border-b border-border dark:bg-background/90 bg-white/85 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center space-x-2">
            <Drawer
              key={`search-drawer-${pathname}`}
              swipeDirection="left"
              open={mobileDrawerOpen}
              onOpenChange={setMobileDrawerOpen}
            >
              <DrawerTrigger
                render={
                  <Button
                    size="icon-lg"
                    variant="ghost"
                    className="md:hidden"
                    aria-label="Abrir menu principal"
                  >
                    <BsList className="size-4 text-gray-800 dark:text-white" />
                  </Button>
                }
              />
              <DrawerContent className="w-screen">
                <SearchDrawerNavigation
                  pathname={pathname}
                  user={user}
                  handleLogout={handleLogout}
                />
              </DrawerContent>
            </Drawer>
            <Link href="/">
              <h1 className="font-heading text-2xl font-semibold tracking-normal text-primary dark:text-white">
                Skillsy
              </h1>
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="md:flex items-center gap-4 w-full max-w-2xl hidden"
          >
            <div className="relative w-full">
              <BsSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500"
                size={20}
              />
              <Input
                name="q"
                aria-label="Buscar profissionais e serviços"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que você procura? Pintor, Advogado, Bolo de Pote…"
                className="pl-12 h-10 w-full  placeholder:text-gray-400  rounded-full placeholder:sm:text-sm"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Buscar profissionais"
                className="rounded-r-full absolute right-1 top-1/2 -translate-y-1/2 bg-primary  text-white px-6 h-8  hidden sm:flex justify-center items-center transition-colors"
              >
                <BsSearch className=" text-white" size={20} />
              </Button>
            </div>
          </form>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {user && <OpportunityNotifications />}
            {user ? (
              <Avatar className="size-9">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <AuthModal>
                <Button
                  variant="default"
                  size="sm"
                  title="Faça login ou crie sua conta"
                  aria-label="Entrar ou criar conta"
                  className="w-9 md:w-auto h-9 normal-case lg:px-6"
                >
                  <BsBoxArrowInRight className="block size-4 md:hidden" />
                  <span className="hidden font-medium md:block">Entrar</span>
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
        <div className="container px-4 mx-auto flex items-center justify-between gap-4 py-2 md:hidden">
          <form
            onSubmit={handleSearch}
            className="md:hidden items-center gap-4 w-full max-w-2xl flex"
          >
            <div className="relative w-full">
              <BsSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500"
                size={20}
              />

              <Input
                name="q"
                aria-label="Buscar profissionais e serviços"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que você procura?"
                className="pl-12 h-10 w-full bg-white dark:bg-black placeholder:text-gray-400 rounded-full placeholder:text-xs"
              />
            </div>
          </form>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0 space-y-8 hidden lg:block border">
            <div className="p-4 md:p-4">
              <div className="flex items-center space-x-2 mb-6">
                <BsSliders2 className="text-gray-700 size-4 dark:text-white" />
                <h3 className="font-bold text-gray-700 dark:text-white font-heading">
                  Filtros
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="search-state-filter"
                    className="mb-4 block text-xs font-bold text-gray-600 dark:text-white"
                  >
                    Estado
                  </label>
                  <div className="relative">
                    <Select
                      id="search-state-filter"
                      value={state || "all"}
                      onValueChange={(value) =>
                        handleStateChange(value ?? "all")
                      }
                    >
                      <SelectTrigger className="h-12 w-full px-3 text-sm">
                        <SelectValue>
                          {state && state !== "all"
                            ? selectedStateLabel
                            : "Todos os estados"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os estados</SelectItem>
                        {BRAZIL_STATES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="search-category-filter"
                    className="mb-4 block text-xs font-bold text-gray-600 dark:text-white"
                  >
                    Categorias
                  </label>
                  {renderCategoryFilter("search-category-filter")}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-grow space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-600">
                    {`${results.length} resultado${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}`}
                  </p>
                </div>

                <Sheet>
                  <SheetTrigger
                    render={
                      <Button
                        size="icon-lg"
                        aria-label="Abrir filtros"
                        variant="ghost"
                        title="Filtros"
                        className="lg:hidden"
                      >
                        <BsSliders2 className="text-gray-700  size-4" />
                      </Button>
                    }
                  />
                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <section className="w-full">
                      <div className="px-4 h-full">
                        <div className="space-y-6">
                          <div>
                            <label
                              htmlFor="search-mobile-state-filter"
                              className="mb-4 block text-xs font-bold text-text-muted"
                            >
                              Estado
                            </label>
                            <div className="relative">
                              <Select
                                id="search-mobile-state-filter"
                                value={state || "all"}
                                onValueChange={(value) =>
                                  handleStateChange(value ?? "all")
                                }
                              >
                                <SelectTrigger className="h-10 w-full px-3 text-sm">
                                  <SelectValue>
                                    {state && state !== "all"
                                      ? selectedStateLabel
                                      : "Todos os estados"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    Todos os estados
                                  </SelectItem>
                                  {BRAZIL_STATES.map((item) => (
                                    <SelectItem
                                      key={item.value}
                                      value={item.value}
                                    >
                                      {item.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="no-scrollbar space-y-6 overflow-y-auto h-[60dvh]">
                            <label
                              htmlFor="search-mobile-category-filter"
                              className="block text-xs font-bold text-text-muted"
                            >
                              Categorias
                            </label>
                            {renderCategoryFilter(
                              "search-mobile-category-filter",
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  </SheetContent>
                </Sheet>
              </div>

              {hasActiveFilters ? (
                <div className="flex flex-wrap items-center gap-2 p-3 md:p-3">
                  <span className="text-xs font-semibold text-text-muted">
                    Filtros ativos:
                  </span>
                  {query ? (
                    <button
                      type="button"
                      onClick={clearSearchQuery}
                      className=" px-3 py-1 text-xs font-medium  hover:text-primary"
                    >
                      Busca: {query} ×
                    </button>
                  ) : null}
                  {activeLocationLabel ? (
                    <button
                      type="button"
                      onClick={() => handleStateChange("all")}
                      className="rounded-full px-3 py-1 text-xs font-medium hover:text-primary"
                    >
                      Local: {activeLocationLabel} ×
                    </button>
                  ) : null}
                  {selectedCategory ? (
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(null)}
                      className=" px-3 py-1 text-xs font-medium  hover:text-primary"
                    >
                      Categoria: {selectedCategory} ×
                    </button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={clearAllFilters}
                    className="ml-auto h-8 text-xs"
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : null}
            </div>

            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                <div className="space-y-2 ">
                  {paginatedResults.map((provider, idx) => (
                    <motion.div
                      key={provider.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProviderProfileCard provider={provider} variant="list" />
                    </motion.div>
                  ))}

                  {results.length > ITEMS_PER_PAGE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 pb-20 border-t border-border-subtle mt-10">
                      <p className="text-sm font-bold text-text-muted">
                        Página{" "}
                        <span className="text-primary">{currentPage}</span> de{" "}
                        {totalPages}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-lg"
                          aria-label="Ir para a primeira página"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="h-10 w-10  hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronsLeft size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-lg"
                          aria-label="Ir para a página anterior"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className=" hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronLeft size={18} />
                        </Button>

                        <div className="hidden sm:flex items-center gap-1">
                          {Array.from({ length: totalPages }).map(
                            (_, index) => {
                              const pageNum = index + 1;

                              if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 &&
                                  pageNum <= currentPage + 1)
                              ) {
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      currentPage === pageNum
                                        ? "default"
                                        : "outline"
                                    }
                                    aria-label={`Ir para a página ${pageNum}`}
                                    aria-current={
                                      currentPage === pageNum
                                        ? "page"
                                        : undefined
                                    }
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`h-10 w-10  transition-all font-bold ${
                                      currentPage === pageNum
                                        ? "bg-primary text-white scale-105"
                                        : "border-border-subtle hover:border-primary/50"
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }

                              if (
                                (pageNum === currentPage - 2 && pageNum > 1) ||
                                (pageNum === currentPage + 2 &&
                                  pageNum < totalPages)
                              ) {
                                return (
                                  <span
                                    key={pageNum}
                                    className="px-1 text-text-muted"
                                  >
                                    …
                                  </span>
                                );
                              }

                              return null;
                            },
                          )}
                        </div>

                        <div className="sm:hidden font-bold text-primary bg-primary/5 px-4 h-10 flex items-center ">
                          {currentPage}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Ir para a próxima página"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="size-10 hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronRight size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-lg"
                          aria-label="Ir para a última página"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className=" hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronsRight size={18} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="text-center py-20 space-y-6">
                    <div className="space-y-2">
                      <Search className="mx-auto size-10 md:size-16 text-blue-300" />
                      <h4 className="text-xl md:text-2xl font-bold text-text-main">
                        Nenhum resultado exato encontrado
                      </h4>
                      <p className="text-text-muted max-w-md mx-auto">
                        Não encontramos profissionais para &quot;{query}&quot;
                        {city
                          ? ` em ${city}, ${state}`
                          : state
                            ? ` em ${selectedStateLabel}`
                            : ""}
                        . Tente termos mais genéricos ou veja as sugestões
                        abaixo.
                      </p>
                    </div>

                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="px-4 h-10"
                    >
                      Limpar filtros
                    </Button>
                  </div>

                  {initialSuggestions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-grow bg-border-subtle" />
                        <h3 className="md:text-lg text-base font-bold text-text-muted tracking-normal shrink-0">
                          {city
                            ? `Membros em ${city}`
                            : state
                              ? `Membros em ${selectedStateLabel}`
                              : "Membros em Destaque"}
                        </h3>
                        <div className="h-px flex-grow bg-border-subtle" />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {initialSuggestions.map((provider) => (
                          <ProviderProfileCard
                            key={provider.uid}
                            provider={provider}
                            variant="list"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
