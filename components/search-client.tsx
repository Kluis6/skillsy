"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SurfacePanel } from "@/components/ui/page-layout";
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
import { BsList, BsXLg } from "react-icons/bs";

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

interface SearchClientProps {
  initialQuery: string;
  initialCity: string;
  initialState: string;
  initialCategory: string;
  initialResults: UserProfile[];
  initialSuggestions: UserProfile[];
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
  const user = profile;

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

  const renderCategoryFilter = (id: string) => (
    <div className="relative">
      <select
        id={id}
        value={selectedCategory || "all"}
        onChange={(event) =>
          handleCategoryChange(
            event.target.value === "all" ? null : event.target.value,
          )
        }
        className="h-12 w-full appearance-none rounded-sm border border-border-subtle bg-surface px-3 pr-10 text-sm text-text-main outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <option value="all">Todas as categorias</option>
        {PROVIDER_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface/30 w-full space-y-2">
      <nav className="sticky top-0 z-50 border-b border-border bg-[color-mix(in_oklab,var(--skillsy-color-surface)_86%,transparent)] backdrop-blur-md">
        <div className="container px-4 mx-auto flex min-h-16 items-center justify-between gap-4 py-2">
          <Drawer
            key={`search-drawer-${pathname}`}
            swipeDirection="left"
            open={mobileDrawerOpen}
            onOpenChange={setMobileDrawerOpen}
          >
            <DrawerTrigger
              className="flex md:hidden"
              render={
                <Button
                  size="icon"
                  className="size-10"
                  variant="ghost"
                  aria-label="Abrir menu principal"
                >
                  <BsList className="size-5 text-foreground" />
                </Button>
              }
            />
            <DrawerContent className="w-full">
              <DrawerHeader className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <DrawerTitle className="text-cyan-800 dark:text-white">
                    Skillsy
                  </DrawerTitle>
                </div>
                <DrawerTrigger
                  render={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="bg-transparent hover:bg-primary/10"
                      aria-label="Fechar menu principal"
                    >
                      <BsXLg className="text-foreground" />
                    </Button>
                  }
                />
              </DrawerHeader>
              <div className="px-4 space-y-4">
                <h3 className="font-medium text-sm text-foreground">
                  Navegação
                </h3>
                <ul className="w-full space-y-1">
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Inicial
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/weareskillsy"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        O que é Skillsy?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/artigosevagas"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Novidades e vagas
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/search"
                        aria-current="page"
                        className="flex text-sm font-semibold text-primary"
                      >
                        Buscar profissional
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/encontrar-ajuda"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Pedir ajuda
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/oportunidades"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Oportunidades
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/join"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Por que participar?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
                      <Link
                        href="/privacidade"
                        className="flex text-sm font-normal text-text-muted"
                      >
                        Privacidade
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="rounded-full p-2 hover:bg-primary/10">
                    <DrawerClose>
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
                        <DrawerClose>
                          <Link
                            className="flex text-sm font-normal text-text-muted"
                            href="/contacts"
                          >
                            Meus Contatos
                          </Link>
                        </DrawerClose>
                      </li>
                      <li className="rounded-full p-2 hover:bg-primary/10">
                        <DrawerClose>
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
                          variant="ghost"
                          className="w-full justify-start px-3 text-sm font-normal text-text-muted"
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
                <DrawerClose>
                  <Link
                    className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-center text-sm font-medium text-primary-foreground shadow-[var(--skillsy-elevation-level1)] hover:bg-primary/90 active:bg-primary/80"
                    href="/donation"
                  >
                    Ajude o projeto
                  </Link>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Link href="/">
            <h1 className="text-xl font-bold text-primary tracking-tighter">
              Skillsy
            </h1>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/search"
              aria-current="page"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Buscar profissional
            </Link>
            <Link
              href="/encontrar-ajuda"
              className="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-primary/10 hover:text-primary"
            >
              Pedir ajuda
            </Link>
            <Link
              href="/oportunidades"
              className="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-primary/10 hover:text-primary"
            >
              Oportunidades
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="md:flex items-center gap-4 w-full max-w-2xl hidden"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
                size={20}
              />
              <Input
                name="q"
                aria-label="Buscar profissionais e serviços"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que você procura? Pintor, Advogado, Bolo de Pote…"
                className="pl-12 h-10 w-full bg-card border-border-subtle text-text-main placeholder:text-text-muted shadow-sm rounded-full placeholder:sm:text-sm"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Buscar profissionais"
                className="rounded-r-full absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-6 h-8 font-bold hidden sm:flex justify-center items-center transition-colors"
              >
                <Search className=" text-white" size={20} />
              </Button>
            </div>
          </form>

          {user ? (
            <Avatar className="size-7 ring-2 ring-offset-2 ring-border-subtle md:ml-1.5 mr-1">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-7" />
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
                <MdLogin className="flex md:hidden size-4" />
                <p className="hidden font-medium md:block"> Entrar</p>
              </Button>
            </AuthModal>
          )}
        </div>
        <div className="container px-4 mx-auto flex items-center justify-between gap-4 py-2 md:hidden">
          <form
            onSubmit={handleSearch}
            className="md:hidden items-center gap-4 w-full max-w-2xl flex"
          >
            <div className="relative w-full">
              <MdSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                size={20}
              />

              <Input
                name="q"
                aria-label="Buscar profissionais e serviços"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que você procura?"
                className="pl-12 h-10 w-full bg-white border-border hover:border-border focus:border-0  dark:bg-black  transition-shadow text-text-main placeholder:text-text-muted shadow-sm focus:shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-full placeholder:text-xs"
              />
            </div>

            {/* <Button
              type="submit"
              size="sm"
              className="rounded-sm bg-primary hover:bg-primary/90 text-white px-6 h-10 font-bold hidden sm:flex transition-colors"
            >
              Pesquisar
            </Button> */}
          </form>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0 space-y-8 hidden lg:block">
            <SurfacePanel className="p-4 md:p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-main flex items-center gap-2 font-heading">
                  <SlidersHorizontal size={18} className="text-primary" />{" "}
                  Filtros
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="search-state-filter"
                    className="mb-4 block text-xs font-bold text-text-muted"
                  >
                    Estado
                  </label>
                  <div className="relative">
                    <select
                      id="search-state-filter"
                      value={state || "all"}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full appearance-none rounded-sm border border-border-subtle bg-surface h-12 px-3 pr-10 text-sm text-text-main outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <option value="all">Todos os estados</option>
                      {BRAZIL_STATES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="search-category-filter"
                    className="mb-4 block text-xs font-bold text-text-muted"
                  >
                    Categorias
                  </label>
                  {renderCategoryFilter("search-category-filter")}
                </div>
              </div>
            </SurfacePanel>
          </aside>

          <div className="flex-grow space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-text-muted">
                    {`${results.length} resultado${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}`}
                  </p>
                </div>

                <Sheet>
                  <SheetTrigger
                    render={
                      <Button
                        size="icon"
                        aria-label="Abrir filtros"
                        className="rounded-full md:hidden size-10"
                        variant="ghost"
                        title="Filtros"
                      >
                        <SlidersHorizontal
                          size={18}
                          className="text-foreground"
                        />
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
                              <select
                                id="search-mobile-state-filter"
                                value={state || "all"}
                                onChange={(e) =>
                                  handleStateChange(e.target.value)
                                }
                                className="w-full appearance-none rounded-sm border border-border-subtle bg-surface h-12 px-3 pr-10 text-sm text-text-main outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                              >
                                <option value="all">Todos os estados</option>
                                {BRAZIL_STATES.map((item) => (
                                  <option key={item.value} value={item.value}>
                                    {item.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
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
                <SurfacePanel className="flex flex-wrap items-center gap-2 p-3 md:p-3">
                  <span className="text-xs font-semibold text-text-muted">
                    Filtros ativos:
                  </span>
                  {query ? (
                    <button
                      type="button"
                      onClick={clearSearchQuery}
                      className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-main hover:text-primary"
                    >
                      Busca: {query} ×
                    </button>
                  ) : null}
                  {activeLocationLabel ? (
                    <button
                      type="button"
                      onClick={() => handleStateChange("all")}
                      className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-main hover:text-primary"
                    >
                      Local: {activeLocationLabel} ×
                    </button>
                  ) : null}
                  {selectedCategory ? (
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(null)}
                      className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-main hover:text-primary"
                    >
                      Categoria: {selectedCategory} ×
                    </button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="ml-auto h-8 text-xs"
                  >
                    Limpar filtros
                  </Button>
                </SurfacePanel>
              ) : null}
            </div>

            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                <div className="space-y-2 md:space-y-6">
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
                          size="icon"
                          aria-label="Ir para a primeira página"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="h-10 w-10 rounded-sm border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronsLeft size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Ir para a página anterior"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="size-10 rounded-sm border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
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
                                    className={`h-10 w-10 rounded-md transition-all font-bold ${
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

                        <div className="sm:hidden font-bold text-primary bg-primary/5 px-4 h-10 flex items-center rounded-xl">
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
                          className="size-10 rounded-xl border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronRight size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Ir para a última página"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="h-10 w-10 rounded-xl border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
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
