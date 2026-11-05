"use client";

import Link from "next/link";
import { HERO_OVERLAY_CLASS } from "@/lib/hero";
import Form from "next/form";
import { motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { CepFilter } from "@/components/cep-filter";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { BsSearch } from "react-icons/bs";
import { useT } from "@/lib/i18n/provider";

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
  const t = useT();
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
      <div className={`absolute inset-0 z-10 ${HERO_OVERLAY_CLASS}`} />

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
            <h2 className="text-balance font-heading drop-shadow-xl/50 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-white  md:text-7xl lg:text-8xl">
              {t("common.slogan")}
            </h2>
            <p className="mx-auto hidden md:block max-w-2xl text-base font-semibold leading-relaxed text-white md:text-xl lg:mx-0">
              {t("home.heroText")}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full will-change-transform lg:col-span-5"
        >
          <Card className="border-none p-4 shadow-xl md:p-6">
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-main">
                {t("home.findSomeone")}
              </p>
              <p className="text-sm text-text-muted">
                {t("home.findSomeoneHint")}
              </p>
            </div>

            <Form
              action="/search"
              className="flex flex-col w-full space-y-5 justify-center items-center"
            >
              <div className="relative w-full flex justify-center items-center">
                <BsSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                  size={20}
                />
                <Input
                  name="q"
                  aria-label={t("home.searchAria")}
                  placeholder={t("home.searchPlaceholder")}
                  className="h-12 w-full bg-background pl-10 pr-12 text-text-main placeholder:text-text-muted"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:bg-surface hover:text-text-main"
                    aria-label={t("home.clearSearch")}
                  >
                    <X className="size-4" />
                  </Button>
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
                {t("home.location")}{" "}
                <span className="text-primary font-semibold">
                  {locationFilter
                    ? `${locationFilter.city}, ${locationFilter.state}`
                    : t("home.allBrazil")}
                </span>
              </p>

              <div className="flex flex-col w-full gap-3">
                <CepFilter onLocationChange={setLocationFilter} />
                <Button
                  type="submit"
                  variant="default"
                  className="h-12 w-full font-medium text-base bg-primary hover:bg-primary/90 text-primary-foreground active:bg-primary/80"
                >
                  {searching ? t("home.searching") : t("home.searchTalent")}
                </Button>
              </div>
            </Form>

            <div className="mt-5 border-t border-border-subtle pt-5">
              {showSignupCta ? (
                <AuthModal>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between px-0 sm:px-4 py-3 text-left text-primary hover:bg-accent"
                  >
                    <span>
                      <span className="block text-xs font-bold text-primary">
                        {t("home.signupTitle")}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {t("home.signupHint")}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-primary" />
                  </Button>
                </AuthModal>
              ) : (
                <Button
                  render={<Link href="/profile" />}
                  nativeButton={false}
                  variant="ghost"
                  className="h-auto w-full justify-between px-4 py-3 text-left text-primary hover:bg-accent"
                >
                  <span>
                    <span className="block text-xs font-bold text-primary">
                      {t("home.profileTitle")}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {t("home.profileHint")}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-primary" />
                </Button>
              )}
            </div>
          </Card>
          <p className="mx-auto md:hidden text-center mt-6 text-pretty text-base font-semibold leading-relaxed text-white md:text-xl lg:mx-0 drop-shadow-lg/50">
            {t("home.heroText")}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
