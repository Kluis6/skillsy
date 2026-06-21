"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
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
import { shouldShowVerifiedBadge } from "@/lib/member-verification";

const SEARCH_CATEGORIES = [
  "Tecnologia",
  "Design",
  "Marketing",
  "Consultoria",
  "Vendas",
  "Aulas",
  "Cozinha",
  "Doméstico",
  "Limpeza",
  "Marcenaria",
  "Manutenção",
  "Construção Civil",
  "Beleza",
  "Educação",
  "Saúde",
  "Eventos",
  "Jurídico",
  "Financeiro",
  "Assistência",
  "Reformas",
  "Automotivo",
  "Moda",
  "Bem Estar",
  "Pet Care",
  "Fotografia",
  "Música",
  "Idiomas",
  "Esportes",
  "Festas",
  "Transporte",
] as const;

interface SearchClientProps {
  initialQuery: string;
  initialCity: string;
  initialState: string;
  initialResults: UserProfile[];
  initialSuggestions: UserProfile[];
}

export function SearchClient({
  initialQuery,
  initialCity,
  initialState,
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, city, state, selectedCategory]);

  const results = useMemo(() => {
    if (!selectedCategory) {
      return initialResults;
    }

    return initialResults.filter(
      (provider) =>
        provider.category === selectedCategory ||
        provider.serviceType
          ?.toLowerCase()
          .includes(selectedCategory.toLowerCase()),
    );
  }, [initialResults, selectedCategory]);

  const paginatedResults = useMemo(
    () =>
      results.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [currentPage, results],
  );

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const shouldShowBackButton =
    pathname === "/profile" ||
    pathname === "/contacts" ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/contacts/");

  const createRouteParams = (overrides?: {
    q?: string | null;
    city?: string | null;
    state?: string | null;
  }) => {
    const params = new URLSearchParams();
    const nextQuery = overrides?.q ?? query;
    const nextCity = overrides?.city ?? city;
    const nextState = overrides?.state ?? state;

    if (nextQuery?.trim()) {
      params.set("q", nextQuery.trim());
    }

    if (nextState?.trim()) {
      params.set("state", nextState.trim());
    }

    if (nextCity?.trim()) {
      params.set("city", nextCity.trim());
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

  return (
    <div className="min-h-screen bg-surface/30 w-full space-y-2">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="container px-4 mx-auto flex items-center justify-between gap-4 py-2">
          <Drawer
            key={`search-drawer-${pathname}`}
            direction="left"
            open={mobileDrawerOpen}
            onOpenChange={setMobileDrawerOpen}
          >
            <DrawerTrigger asChild className="flex md:hidden">
              <Button size="icon" className="size-10" variant="ghost">
                <BsList className="size-5 text-foreground" />
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
                    variant="ghost"
                    className="bg-card hover:bg-surface"
                  >
                    <BsXLg className="text-foreground" />
                  </Button>
                </DrawerTrigger>
              </DrawerHeader>
              <div className="px-4 space-y-4">
                <h3 className="font-medium text-sm text-text-main">
                  Navegação
                </h3>
                <ul className="w-full space-y-1">
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/weareskillsy"
                        className="flex text-sm font-normal text-text-main"
                      >
                        O que é Skillsy?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/artigosevagas"
                        className="flex text-sm font-normal text-text-main"
                      >
                        Novidades e vagas
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/join"
                        className="flex text-sm font-normal text-text-main"
                      >
                        Por que participar?
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/privacidade"
                        className="flex text-sm font-normal text-text-main"
                      >
                        Privacidade
                      </Link>
                    </DrawerClose>
                  </li>
                  <li className="p-2 hover:bg-surface">
                    <DrawerClose asChild>
                      <Link
                        href="/termos"
                        className="flex text-sm font-normal text-text-main"
                      >
                        Termos de uso
                      </Link>
                    </DrawerClose>
                  </li>
                </ul>

                {user && (
                  <>
                    <h3 className="font-medium text-sm text-text-main">
                      Minha conta
                    </h3>

                    <ul className="space-y-1">
                      <li className="hover:bg-surface p-2">
                        <DrawerClose asChild>
                          <Link
                            className="flex text-sm font-normal text-text-main"
                            href="/contacts"
                          >
                            Meus Contatos
                          </Link>
                        </DrawerClose>
                      </li>
                      <li className="hover:bg-surface p-2">
                        <DrawerClose asChild>
                          <Link
                            className="flex text-sm font-normal text-text-main"
                            href="/profile"
                          >
                            Configurações do Perfil
                          </Link>
                        </DrawerClose>
                      </li>
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm px-2 h-9 hover:bg-surface font-normal text-text-main rounded-none"
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
                <DrawerClose asChild>
                  <Link
                    className="text-center bg-primary p-2 h-10 font-medium text-sm text-white rounded-sm"
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que você procura? Pintor, Advogado, Bolo de Pote..."
                className="pl-12 h-10 w-full bg-card border-border-subtle text-text-main placeholder:text-text-muted shadow-sm rounded-full placeholder:sm:text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-r-full absolute right-1 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 h-8 font-bold hidden sm:flex justify-center items-center transition-all"
              >
                <Search
                  className=" text-white"
                  size={20}
                />
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
                title="Faça login ou cria sua conta"
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 w-10 md:w-auto md:px-4 h-10"
              >
                <LuLogIn className="block md:hidden" />
                <p className="hidden md:block"> Entrar</p>
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
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
                size={20}
              />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que você procura? Pintor, Advogado, Bolo de Pote..."
                className="pl-12 h-10 w-full bg-card border-border-subtle text-text-main placeholder:text-text-muted shadow-sm rounded-full placeholder:text-xs"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="rounded-sm bg-blue-500 hover:bg-blue-600 text-white px-6 h-10 font-bold hidden sm:flex transition-all"
            >
              Pesquisar
            </Button>
          </form>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0 space-y-8 hidden lg:block">
            <div className="bg-card p-4 border border-border-subtle">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-main flex items-center gap-2 font-heading">
                  <SlidersHorizontal size={18} className="text-primary" />{" "}
                  Filtros
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">
                    Estado
                  </p>
                  <div className="relative">
                    <select
                      value={state || "all"}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full appearance-none rounded-sm border border-border-subtle bg-plate-100 h-12 px-3 pr-10 text-sm text-text-main outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">
                    Categorias
                  </p>
                  <div className="space-y-3">
                    {SEARCH_CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 text-sm font-medium text-text-muted hover:text-primary cursor-pointer transition-colors group"
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${
                            selectedCategory === cat
                              ? "border-primary bg-primary/5"
                              : "border-border-subtle group-hover:border-primary/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={selectedCategory === cat}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategory(cat);
                              } else {
                                setSelectedCategory(null);
                              }
                            }}
                          />
                          <div
                            className={`w-2.5 h-2.5 bg-primary rounded-sm transition-opacity ${
                              selectedCategory === cat
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-10"
                            }`}
                          />
                        </div>
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-grow space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-text-muted tracking-widest">
                {`${results.length} Resultados encontrados`}
              </p>

              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      size="icon"
                      className="rounded-sm md:hidden size-10"
                      variant="outline"
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
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">
                            Estado
                          </p>
                          <div className="relative">
                            <select
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
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                            Categorias
                          </p>
                          <div className="space-y-3">
                            {SEARCH_CATEGORIES.map((cat) => (
                              <label
                                key={cat}
                                className="flex items-center gap-3 text-sm font-medium text-text-muted hover:text-primary cursor-pointer transition-colors group"
                              >
                                <div
                                  className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${
                                    selectedCategory === cat
                                      ? "border-primary bg-primary/5"
                                      : "border-border-subtle group-hover:border-primary/30"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedCategory === cat}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCategory(cat);
                                      } else {
                                        setSelectedCategory(null);
                                      }
                                    }}
                                  />
                                  <div
                                    className={`w-2.5 h-2.5 bg-primary rounded-sm transition-opacity ${
                                      selectedCategory === cat
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-10"
                                    }`}
                                  />
                                </div>
                                {cat}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </SheetContent>
              </Sheet>
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
                      <Link href={`/profile/${provider.uid}`}>
                        <div className="flex flex-row gap-6 p-4 md:p-8 border border-border-subtle hover:shadow-2xl transition-all duration-300 bg-card cursor-pointer relative overflow-hidden">
                          <div className="shrink-0 flex flex-col items-center gap-2.5 md:gap-3">
                            <Avatar className="md:size-24 size-12 border-1 md:border-4 border-surface shadow-sm">
                              <AvatarImage src={provider.photoURL} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                                {provider.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1 text-highlight">
                              <Star size={14} fill="currentColor" />
                              <p className="text-sm font-semibold">
                                {provider.rating || "0.0"}
                              </p>
                            </div>
                          </div>

                          <div className="flex-grow md:space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-1">
                                  <h3 className="text-base md:text-2xl font-bold text-text-main font-heading">
                                    {provider.name}
                                  </h3>
                                  {shouldShowVerifiedBadge(provider) ? (
                                    <ShieldCheck
                                      size={15}
                                      className="text-primary"
                                    />
                                  ) : null}
                                </div>

                                <div>
                                  {provider.companyName && (
                                    <p className="font-medium text-xs md:text-sm text-text-main">
                                      {provider.companyName}
                                    </p>
                                  )}

                                  <p className="text-text-muted font-normal text-xs md:text-sm">
                                    {provider.serviceType ||
                                      provider.category ||
                                      "Profissional"}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    <p className="text-text-main block md:hidden font-medium text-xs md:text-sm">
                                      {provider.location || "Brasil"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="py-2 px-3 hidden md:flex"
                              >
                                <MapPin size={12} className="mr-2" />
                                {provider.location || "Brasil"}
                              </Badge>
                            </div>
                            <div className="hidden md:flex">
                              <p className="text-text-muted text-sm line-clamp-2 max-w-2xl">
                                {provider.bio ||
                                  "Este membro da comunidade oferece serviços de alta qualidade com valores compartilhados. Clique para ver mais detalhes e entrar em contato."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {results.length > ITEMS_PER_PAGE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 pb-20 border-t border-border-subtle mt-10">
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
                        Página{" "}
                        <span className="text-primary">{currentPage}</span> de{" "}
                        {totalPages}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="h-10 w-10 rounded-sm border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronsLeft size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
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
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`h-10 w-10 rounded-xl transition-all font-bold ${
                                      currentPage === pageNum
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10"
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
                                    ...
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
                      onClick={() => {
                        setSearchTerm("");
                        const params = createRouteParams({ q: null });
                        router.push(`/search?${params.toString()}`);
                      }}
                      variant="outline"
                      className="px-4 h-10"
                    >
                      Limpar Filtro de Busca
                    </Button>
                  </div>

                  {initialSuggestions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-grow bg-border-subtle" />
                        <h3 className="md:text-lg text-base font-bold text-text-muted tracking-widest shrink-0">
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
                          <Link
                            href={`/profile/${provider.uid}`}
                            key={provider.uid}
                          >
                            <div className="flex flex-row gap-6 p-4 md:p-8 border border-border-subtle hover:shadow-2xl transition-all duration-300 bg-card cursor-pointer relative overflow-hidden">
                              <div className="shrink-0 flex flex-col items-center gap-2.5 md:gap-3">
                                <Avatar className="md:size-24 size-12 border-1 md:border-4 border-surface shadow-sm">
                                  <AvatarImage src={provider.photoURL} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                                    {provider.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1 text-highlight">
                                  <Star size={14} fill="currentColor" />
                                  <p className="text-sm font-semibold">
                                    {provider.rating || "0.0"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-grow md:space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <h3 className="text-base md:text-2xl font-bold text-text-main font-heading">
                                        {provider.name}
                                      </h3>
                                      {shouldShowVerifiedBadge(provider) ? (
                                        <ShieldCheck
                                          size={15}
                                          className="text-primary"
                                        />
                                      ) : null}
                                    </div>

                                    <div>
                                      {provider.companyName && (
                                        <p className="font-medium text-xs md:text-sm text-text-main">
                                          {provider.companyName}
                                        </p>
                                      )}

                                      <p className="text-text-muted font-normal text-xs md:text-sm">
                                        {provider.serviceType ||
                                          provider.category ||
                                          "Profissional"}
                                      </p>
                                      <div className="flex items-center space-x-1">
                                        <p className="text-text-main block md:hidden font-medium text-xs md:text-sm">
                                          {provider.location || "Brasil"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="py-2 px-3 hidden md:flex"
                                  >
                                    <MapPin size={12} className="mr-2" />
                                    {provider.location || "Brasil"}
                                  </Badge>
                                </div>
                                <div className="hidden md:flex">
                                  <p className="text-text-muted text-sm line-clamp-2 max-w-2xl">
                                    {provider.bio ||
                                      "Este membro da comunidade oferece serviços de alta qualidade com valores compartilhados. Clique para ver mais detalhes e entrar em contato."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
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
