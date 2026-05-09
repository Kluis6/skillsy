"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/user-service";
import { UserProfile } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  X,
  SlidersHorizontal,
  UserPlus,
  UserMinus,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CalendarDays,
  Church,
  UserIcon,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { CepFilter } from "@/components/cep-filter";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "./auth-modal";
import { BRAZIL_STATES } from "@/lib/brazil-states";

import { BsList, BsXLg } from "react-icons/bs";

import {
  Drawer,
  DrawerHeader,
  DrawerFooter,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

function SearchResultsContent() {
  const { profile, toggleContact } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const selectedStateLabel =
    BRAZIL_STATES.find((item) => item.value === state)?.label || state;

  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset pagination on filter change
    const fetchResults = async () => {
      setLoading(true);
      try {
        const location = city || state ? { city, state } : undefined;
        let data = await UserService.searchProviders(query, location);

        if (selectedCategory) {
          data = data.filter(
            (p) =>
              p.category === selectedCategory ||
              p.serviceType
                ?.toLowerCase()
                .includes(selectedCategory.toLowerCase()),
          );
        }

        setResults(data);

        // If no results, fetch suggestions from the same location
        if (data.length === 0 && location) {
          const suggestedData = await UserService.searchProviders("", location);
          setSuggestions(suggestedData.slice(0, 3));
        } else if (data.length === 0) {
          // If no location, fetch any featured providers
          const featured = await UserService.getProviders(3);
          setSuggestions(featured);
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, city, state, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchTerm);
    router.push(`/search?${params.toString()}`);
  };
  const auth = useAuth();
  const user = profile;
  const logout = auth.logout;

  const pathname = usePathname();

  const shouldShowBackButton =
    pathname === "/profile" ||
    pathname === "/contacts" ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/contacts/");
  return (
    <div className="min-h-screen bg-surface/30 w-full space-y-2">
      {/* Header / Search Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="container px-4 mx-auto flex items-center justify-between gap-4  py-2">
          <Drawer direction="left">
            <DrawerTrigger asChild className="flex md:hidden">
              <Button size="icon" className="size-10" variant="ghost">
                <BsList className="size-5 text-gray-700" />
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
          <Link href="/" className="">
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
                className="pl-12 h-10 w-full bg-white placeholder:text-gray-400 shadow-sm rounded-full placeholder:sm:text-sm "
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

          {user ? (
            <Avatar className="size-7 ring-2 ring-offset-2 ring-zinc-400 md:ml-1.5 mr-1">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                <UserIcon className="size-7" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <AuthModal>
              <Button variant="default" className="bg-blue-600 px-4">
                Entrar
              </Button>
            </AuthModal>
          )}
        </div>
        <div className="container px-4 mx-auto flex items-center justify-between gap-4  py-2 md:hidden">
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
                className="pl-12 h-10 w-full bg-white placeholder:text-gray-400 shadow-sm rounded-full placeholder:text-xs"
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

      {/* <div className="bg-card border-b border-border-subtle py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <CepFilter
              initialLocation={city && state ? { city, state } : null}
              onLocationChange={(loc) => {
                const params = new URLSearchParams(searchParams.toString());
                if (loc) {
                  params.set("city", loc.city);
                  params.set("state", loc.state);
                } else {
                  params.delete("city");
                  params.delete("state");
                }
                router.push(`/search?${params.toString()}`);
              }}
            />
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-border-subtle pl-6 py-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Filtrando por:{" "}
              <span className="text-primary">
                {city && state
                  ? `${city}, ${state}`
                  : state
                    ? selectedStateLabel
                    : "Todo o Brasil"}
              </span>
            </p>
            {(city || state) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          params.delete("city");
                          params.delete("state");
                          router.push(`/search?${params.toString()}`);
                        }}
                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                      />
                    }
                  >
                    <X size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Remover Filtro de Localização</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div> */}

      <main className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-72 shrink-0 space-y-8 hidden lg:block">
            <div className="bg-white p-4 border border-border-subtle">
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
                  <Select
                    value={state || "all"}
                    onValueChange={(selectedState) => {
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );

                      if (selectedState === "all" || selectedState == null) {
                        params.delete("state");
                        params.delete("city");
                      } else {
                        params.set("state", selectedState);
                        if (selectedState !== state) {
                          params.delete("city");
                        }
                      }

                      router.push(`/search?${params.toString()}`);
                    }}
                  >
                    <SelectTrigger className="w-full rounded-sm border-border-subtle bg-plate-100 h-12 text-sm">
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {BRAZIL_STATES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">
                    Categorias
                  </p>
                  <div className="space-y-3">
                    {[
                      "Tecnologia",
                      "Design",
                      "Marketing",
                      "Consultoria",
                      "Cozinha",
                      "Limpeza",
                      "Manutenção",
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
                    ].map((cat) => (
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

          {/* Results List */}
          <div className="flex-grow space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-text-muted tracking-widest">
                {loading
                  ? "Buscando membros..."
                  : `${results.length} Resultados encontrados`}
              </p>

              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      size="icon"
                      className="rounded-sm md:hidden "
                      variant="outline"
                    >
                      <SlidersHorizontal size={18} className="text-gray-700" />
                    </Button>
                  }
                />
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle> Filtros</SheetTitle>
                  </SheetHeader>
                  <section className="w-full">
                    <div className="px-4  h-full">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">
                            Estado
                          </p>
                          <Select
                            value={state || "all"}
                            onValueChange={(selectedState) => {
                              const params = new URLSearchParams(
                                searchParams.toString(),
                              );

                              if (
                                selectedState === "all" ||
                                selectedState == null
                              ) {
                                params.delete("state");
                                params.delete("city");
                              } else {
                                params.set("state", selectedState);
                                if (selectedState !== state) {
                                  params.delete("city");
                                }
                              }

                              router.push(`/search?${params.toString()}`);
                            }}
                          >
                            <SelectTrigger className="w-full rounded-sm bg-surface h-12 text-sm">
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {BRAZIL_STATES.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="no-scrollbar space-y-6 overflow-y-auto h-[60dvh]">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ">
                            Categorias
                          </p>
                          <div className="space-y-3">
                            {[
                              "Tecnologia",
                              "Design",
                              "Marketing",
                              "Consultoria",
                              "Cozinha",
                              "Limpeza",
                              "Manutenção",
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
                            ].map((cat) => (
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
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-48 w-full rounded-sm"
                    />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2 md:space-y-6">
                  {results
                    .slice(
                      (currentPage - 1) * ITEMS_PER_PAGE,
                      currentPage * ITEMS_PER_PAGE,
                    )
                    .map((p, idx) => (
                      <motion.div
                        key={p.uid}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link href={`/profile/${p.uid}`}>
                          <div className="flex flex-row gap-6 p-4 md:p-8 border border-border-subtle  hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer relative overflow-hidden">
                            <div className="shrink-0 flex flex-col items-center gap-2.5 md:gap-3">
                              <Avatar className="md:size-24 size-12 border-1 md:border-4 border-surface shadow-sm">
                                <AvatarImage src={p.photoURL} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                                  {p.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex items-center gap-1 text-highlight ">
                                <Star size={14} fill="currentColor" />
                                <p className="text-sm font-semibold">
                                  {p.rating || "0.0"}
                                </p>
                              </div>
                            </div>

                            <div className="flex-grow md:space-y-4">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <h3 className="text-base md:text-2xl font-bold text-text-main  font-heading">
                                      {p.name}
                                    </h3>
                                    {p.verifiedMember && (
                                      <ShieldCheck className="text-primary size-4 md:size-6" />
                                    )}
                                  </div>

                                  <div className="">
                                    {p.companyName && (
                                      <p className="font-medium text-xs md:text-sm text-gray-700">
                                        {p.companyName}
                                      </p>
                                    )}

                                    <p className="text-gray-500 font-normal text-xs md:text-sm">
                                      {p.serviceType ||
                                        p.category ||
                                        "Profissional"}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <p className="text-gray-700 block md:hidden font-medium text-xs md:text-sm">
                                        {p.location || "Brasil"}
                                      </p>
                                      <span className="font-bold block md:hidden">·</span>
                                      <p className="text-gray-700 font-medium text-xs md:text-sm">
                                        {p.ward}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="py-2 px-3 hidden md:flex"
                                >
                                  <MapPin size={12} className="mr-2" />
                                  {p.location || "Brasil"}
                                </Badge>
                              </div>
                              <div className="hidden md:flex">
                                <p className="text-text-muted text-sm line-clamp-2 max-w-2xl">
                                  {p.bio ||
                                    "Este membro da comunidade oferece serviços de alta qualidade com valores compartilhados. Clique para ver mais detalhes e entrar em contato."}
                                </p>

                                {/* <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-text-muted/60">
                                  {p.baptismYear && (
                                    <div className="flex items-center gap-1.5">
                                      <Church
                                        size={12}
                                        className="text-primary/60"
                                      />
                                      <span>
                                        Membro há{" "}
                                        {new Date().getFullYear() -
                                          p.baptismYear}{" "}
                                        anos
                                      </span>
                                    </div>
                                  )}
                                  {p.availability &&
                                    p.availability.length > 0 && (
                                      <div className="flex items-center gap-1.5">
                                        <CalendarDays
                                          size={12}
                                          className="text-primary/60"
                                        />
                                        <span>{p.availability.join(", ")}</span>
                                      </div>
                                    )}
                                  {p.serviceHours && (
                                    <div className="flex items-center gap-1.5">
                                      <Clock
                                        size={12}
                                        className="text-primary/60"
                                      />
                                      <span>{p.serviceHours}</span>
                                    </div>
                                  )}
                                </div> */}
                              </div>

                              {/* <div className="flex flex-wrap gap-3 pt-2">
                                <div className="flex-grow" />
                                <Button
                                  size="sm"
                                  variant={
                                    profile?.contacts?.includes(p.uid)
                                      ? "destructive"
                                      : "default"
                                  }
                                  className={`h-8 rounded-sm text-[10px] font-bold  tracking-widest transition-all ${profile?.contacts?.includes(p.uid) ? "" : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleContact(p.uid)
                                      .then(() => {
                                        if (profile)
                                          toast.success(
                                            "Lista de contatos atualizada",
                                          );
                                      })
                                      .catch(() => {});
                                  }}
                                >
                                  {profile?.contacts?.includes(p.uid) ? (
                                    <>
                                      <UserMinus size={14} className="md:mr-1.5" />
                                      <p className="hidden md:block">Remover</p>
                                      
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus size={14} className="md:mr-1.5" />
                                      <p className="hidden md:block">Conectar</p>
                                    </>
                                  )}
                                </Button>
                              </div> */}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}

                  {/* Pagination Component */}
                  {results.length > ITEMS_PER_PAGE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 pb-20 border-t border-border-subtle mt-10">
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
                        Página
                        <span className="text-primary">{currentPage}</span> de
                        {Math.ceil(results.length / ITEMS_PER_PAGE)}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="h-10 w-10 rounded-xl border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
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
                          className="h-10 w-10 rounded-xl border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronLeft size={18} />
                        </Button>

                        {/* Mobile pagination simplified, Desktop shows numbers */}
                        <div className="hidden sm:flex items-center gap-1">
                          {Array.from({
                            length: Math.ceil(results.length / ITEMS_PER_PAGE),
                          }).map((_, i) => {
                            const pageNum = i + 1;
                            // Show first, last, current, and neighbors
                            if (
                              pageNum === 1 ||
                              pageNum ===
                                Math.ceil(results.length / ITEMS_PER_PAGE) ||
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
                            } else if (
                              (pageNum === currentPage - 2 && pageNum > 1) ||
                              (pageNum === currentPage + 2 &&
                                pageNum <
                                  Math.ceil(results.length / ITEMS_PER_PAGE))
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
                          })}
                        </div>

                        {/* Mobile page number display */}
                        <div className="sm:hidden font-bold text-primary bg-primary/5 px-4 h-10 flex items-center rounded-xl">
                          {currentPage}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                Math.ceil(results.length / ITEMS_PER_PAGE),
                                prev + 1,
                              ),
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(results.length / ITEMS_PER_PAGE)
                          }
                          className="h-10 w-10 rounded-xl border-border-subtle hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                          <ChevronRight size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(results.length / ITEMS_PER_PAGE),
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(results.length / ITEMS_PER_PAGE)
                          }
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
                  <div className="text-center py-20 bg-card rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Search className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">
                      Nenhum resultado exato encontrado
                    </h4>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      Não encontramos profissionais para &quot;{query}&quot;
                      {city
                        ? ` em ${city}, ${state}`
                        : state
                          ? ` em ${selectedStateLabel}`
                          : ""}
                      . Tente termos mais genéricos ou veja as sugestões abaixo.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.delete("q");
                        router.push(`/search?${params.toString()}`);
                      }}
                      variant="outline"
                      className="rounded-xl px-8"
                    >
                      Limpar Filtro de Busca
                    </Button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-grow bg-slate-200" />
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest shrink-0">
                          {city
                            ? `Membros em ${city}`
                            : state
                              ? `Membros em ${selectedStateLabel}`
                              : "Membros em Destaque"}
                        </h3>
                        <div className="h-px flex-grow bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {suggestions.map((p) => (
                          <Link href={`/profile/${p.uid}`} key={p.uid}>
                            <div className="group p-6 rounded-[2rem]  hover:shadow-lg transition-all bg-white cursor-pointer flex items-center gap-6">
                              <Avatar className="w-16 h-16 border-2 border-slate-50">
                                <AvatarImage src={p.photoURL} />
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                  {p.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                  {p.name}
                                </h4>
                                <p className="text-sm text-primary font-medium">
                                  {p.companyName && (
                                    <span className="text-slate-500 font-normal">
                                      {p.companyName} •{" "}
                                    </span>
                                  )}
                                  {p.serviceType || p.category}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1 text-highlight font-bold text-xs">
                                    <Star size={12} fill="currentColor" />{" "}
                                    {p.rating || "0.0"}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <MapPin size={10} /> {p.location}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight
                                size={20}
                                className="text-slate-300 group-hover:text-primary transition-all"
                              />
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
    </div>
  );
}

export function SearchClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <Skeleton className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-40 w-full rounded-3xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
              </div>
              <div className="lg:col-span-3 space-y-8">
                <Skeleton className="h-16 w-full rounded-full" />
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}