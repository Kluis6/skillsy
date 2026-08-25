"use client";

import Link from "next/link";
import Form from "next/form";
import { motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { CepFilter } from "@/components/cep-filter";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { BsSearch } from "react-icons/bs";

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searching: boolean;
  locationFilter: { city: string; state: string } | null;
  setLocationFilter: (loc: { city: string; state: string } | null) => void;
  showSignupCta?: boolean;
}

export function HeroSection({
  searchTerm,
  setSearchTerm,
  searching,
  locationFilter,
  setLocationFilter,
  showSignupCta = true,
}: HeroSectionProps) {
  const heroTransition = {
    type: "spring" as const,
    visualDuration: 0.7,
    bounce: 0.18,
  };

  const heroVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: heroTransition,
    },
  };

  return (
    <section className="relative isolate w-full min-h-[calc(100svh-5rem)] overflow-hidden bg-surface bg-[url(/bannerhero.png)] bg-cover bg-center md:min-h-[86vh]">
      <div className="absolute inset-0 z-10 aspect-video bg-black/35" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={heroVariants}
        className="container relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] grid-cols-1 items-center gap-10 px-4 py-12 md:min-h-[91vh] lg:grid-cols-12"
      >
        <motion.div
          variants={itemVariants}
          className="w-full space-y-6 text-center will-change-transform lg:col-span-7 lg:text-left"
        >
          <div className="space-y-4">
            <p className="text-2xl font-bold text-white drop-shadow-lg/50">
              Skillsy
            </p>
            <h2 className="text-balance font-heading drop-shadow-xl/50 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-white  md:text-7xl lg:text-8xl">
              Onde Talentos encontram oportunidades
            </h2>
            <p className="mx-auto hidden md:block max-w-2xl text-base font-semibold leading-relaxed text-white md:text-xl lg:mx-0">
              O Skillsy conecta membros, profissionais e negócios em uma rede
              onde indicação, confiança e propósito caminham juntos.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full will-change-transform lg:col-span-5"
        >
          <Card className=" border-none p-4 shadow-sm md:p-6">
            <div className=" space-y-1">
              <p className="text-sm font-bold text-text-main">
                Encontre alguém da rede
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-100">
                busque por profissionais e oportunidades
              </p>
            </div>

            <Form
              action="/search"
              className="flex flex-col w-full space-y-5 justify-center items-center"
            >
              <div className="relative w-full flex justify-center items-center">
                <BsSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600"
                  size={20}
                />
                <Input
                  name="q"
                  aria-label="Buscar talentos, profissionais e serviços"
                  placeholder="O que você precisa?"
                  className="h-12 w-full rounded-full bg-background pl-10 pr-12 text-text-main placeholder:text-gray-400  dark:bg-background/90 dark:placeholder:text-gray-500 "
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text-main "
                    aria-label="Limpar busca"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              {locationFilter && (
                <>
                  <input
                    type="hidden"
                    name="city"
                    value={locationFilter.city}
                  />
                  <input
                    type="hidden"
                    name="state"
                    value={locationFilter.state}
                  />
                </>
              )}

              <p className="w-full text-xs font-normal text-text-muted">
                Localização:{" "}
                <span className="text-primary font-semibold">
                  {locationFilter
                    ? `${locationFilter.city}, ${locationFilter.state}`
                    : "Todo o Brasil"}
                </span>
              </p>

              <div className="flex flex-col w-full gap-3">
                <CepFilter onLocationChange={setLocationFilter} />
                <Button
                  type="submit"
                  variant="default"
                  className="h-12 w-full font-medium text-base bg-primary hover:bg-primary/90 text-white active:bg-primary/80"
                >
                  {searching ? "Pesquisando..." : "Buscar talento"}
                </Button>
              </div>
            </Form>

            <div className="mt-5 border-t border-border-subtle pt-5 ">
              {showSignupCta ? (
                <AuthModal>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between px-0 sm:px-4 py-3 text-left text-primary hover:bg-cyan-50  dark:hover:bg-cyan-950/40"
                  >
                    <span>
                      <span className="block text-xs font-bold dark:text-white text-cyan-800">
                        Seu talento também pode ajudar alguém.
                      </span>
                      <span className="block text-xs  dark:text-gray-100 text-cyan-700">
                        Crie seu perfil na comunidade.
                      </span>
                    </span>
                    <ArrowRight className="size-4 dark:text-white text-cyan-800 " />
                  </Button>
                </AuthModal>
              ) : (
                <Button
                  render={<Link href="/profile" />}
                  nativeButton={false}
                  variant="ghost"
                  className="h-auto w-full justify-between px-4 py-3 text-left text-primary  dark:hover:bg-cyan-950/40"
                >
                  <span>
                    <span className="block text-xs font-bold dark:text-white text-cyan-800">
                      Mantenha seu perfil pronto para ser encontrado.
                    </span>
                    <span className="block text-xs dark:text-gray-100 text-cyan-700">
                      Atualize suas skills e contatos.
                    </span>
                  </span>
                  <ArrowRight className="size-4 dark:text-white text-cyan-800" />
                </Button>
              )}
            </div>
          </Card>
          <p className="mx-auto md:hidden text-center mt-6 text-pretty text-base font-semibold leading-relaxed text-white md:text-xl lg:mx-0 drop-shadow-lg/50">
            O Skillsy conecta membros, profissionais e negócios em uma rede onde
            indicação, confiança e propósito caminham juntos.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
