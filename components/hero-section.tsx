"use client";

import Link from "next/link";
import Form from "next/form";
import { HiOutlineMegaphone } from "react-icons/hi2";
import { motion } from "motion/react";
import {
  ArrowRight,
  HeartHandshake,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { CepFilter } from "@/components/cep-filter";
import { Input } from "@/components/ui/input";

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
    <section className="w-full min-h-[calc(100svh-5rem)] md:min-h-[86vh] bg-[radial-gradient(circle_at_top_left,rgba(0,102,255,0.12),transparent_34%),linear-gradient(180deg,rgba(240,247,255,0.65),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_34%),linear-gradient(180deg,rgba(30,41,59,0.65),rgba(15,23,42,0))]">
      <motion.div
        initial="hidden"
        animate="show"
        variants={heroVariants}
        className="container mx-auto grid min-h-[calc(100svh-5rem)] md:min-h-[86vh] grid-cols-1 items-center gap-10 px-4 py-12 lg:grid-cols-12 "
      >
        <motion.div
          variants={itemVariants}
          className="w-full space-y-6 text-center will-change-transform lg:col-span-7 lg:text-left"
        >
          <div className="space-y-4">
            <h1 className="text-balance font-heading text-5xl font-black leading-[0.95] tracking-[-0.035em] text-text-main md:text-7xl lg:text-8xl">
              A ajuda certa pode estar mais perto do que você imagina.
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-base font-medium leading-relaxed text-text-muted md:text-xl lg:mx-0">
              O Skillsy conecta membros, profissionais e pequenos negócios em
              uma rede onde indicação, confiança e propósito caminham juntos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-text-main lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-border-subtle dark:bg-white/5">
              <ShieldCheck className="size-4 text-primary" />
              Contrate com confiança
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-border-subtle dark:bg-white/5">
              
              <HiOutlineMegaphone className="size-4 stroke-2 text-primary"  />
              Divulgue seu talento
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full will-change-transform lg:col-span-5"
        >
          <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-lg shadow-blue-500/10 md:p-6">
            <div className="mb-5 space-y-1">
              <p className="text-sm font-bold text-text-main">
                Encontre alguém da rede
              </p>
              <p className="text-sm text-text-muted">
                Busque por serviço, talento ou necessidade.
              </p>
            </div>

            <Form
              action="/search"
              className="flex flex-col w-full space-y-5 justify-center items-center"
            >
              <div className="relative w-full flex justify-center items-center">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                  size={20}
                />
                <Input
                  name="q"
                  aria-label="Buscar talentos, profissionais e serviços"
                  placeholder="Ex: pintura, aulas, bolos, advocacia..."
                  className="pl-12 h-12 w-full bg-background border-border-subtle text-text-main placeholder:text-text-muted shadow-sm rounded-full"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              {locationFilter && (
                <>
                  <input type="hidden" name="city" value={locationFilter.city} />
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
                  className="h-12 w-full font-semibold text-base bg-primary hover:bg-primary/90 dark:text-white active:bg-primary/80"
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
                    className="h-auto w-full justify-between rounded-xl px-0 sm:px-4 py-3 text-left text-primary hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40"
                  >
                    <span>
                      <span className="block text-sm font-bold">
                        Seu talento também pode ajudar alguém.
                      </span>
                      <span className="block text-xs text-text-muted">
                        Crie seu perfil na comunidade.
                      </span>
                    </span>
                    <ArrowRight className="size-4" />
                  </Button>
                </AuthModal>
              ) : (
                <Button
                  render={<Link href="/profile" />}
                  nativeButton={false}
                  variant="ghost"
                  className="h-auto w-full justify-between rounded-xl px-4 py-3 text-left text-primary hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40"
                >
                  <span>
                    <span className="block text-sm font-bold">
                      Mantenha seu perfil pronto para ser encontrado.
                    </span>
                    <span className="block text-xs text-text-muted">
                      Atualize suas skills e contatos.
                    </span>
                  </span>
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
