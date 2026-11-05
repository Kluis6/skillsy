"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearchController } from "@/hooks/use-search-controller";
import {
  SearchX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { BenefitsSection } from "@/components/benefits-section";
import { ContactCTA } from "@/components/contact-cta";
import { CategoryCarousel } from "@/components/category-carousel";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/models/types";
import { Categorywall } from "./categorywall";
import { ProviderProfileCard } from "@/components/profile/provider-profile-card";
import { useT } from "@/lib/i18n/provider";

export function HomeClient({
  initialProviders = [],
}: {
  initialProviders?: UserProfile[];
}) {
  const { user, profile, logout } = useAuth();
  const t = useT();
  const [activeTab, setActiveTab] = useState<"explore" | "contacts">("explore");

  // Controllers
  const {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    providers,
    searching,
  } = useSearchController(initialProviders);

  return (
    <div className="h-full w-full">
      <Navbar
        user={user}
        profile={profile}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-col w-full space-y-14">
        <HeroSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searching={searching}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          showSignupCta={!user}
        />

        {/* Categories Carousel */}
        <CategoryCarousel />
        <Categorywall />

        {!user && <BenefitsSection />}

        {/* Main Content */}
        <main className="container mx-auto px-4 ">
          <AnimatePresence mode="wait">
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:space-y-12 space-y-8 "
            >
              <div className="text-center space-y-2 ">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-heading tracking-tight text-center text-text-main">
                  {t("home.providersTitle")}
                </h3>
                <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-text-muted md:text-lg">
                  {t("home.providersText")}
                </p>
              </div>

          

              {providers.length > 0 ? (
                <div className="grid grid-cols-12 gap-y-6 md:gap-6">
                  {providers.map((p, idx) => (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="col-span-12 md:col-span-6 xl:col-span-4"
                    >
                      <ProviderProfileCard provider={p} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto max-w-2xl  bg-surface/40 px-6 py-20 text-center">
                  <SearchX className="mx-auto mb-4 h-12 w-12 text-primary/40" />
                  <h4 className="text-xl font-bold text-text-main">
                    {t("home.emptyTitle")}
                  </h4>
                  <p className="text-sm text-text-muted">
                    {t("home.emptyText")}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTA Section */}
          <ContactCTA />

          {!user && (
            <div className="my-24 text-center flex-col md:flex-row flex w-full justify-center items-center space-x-2 ">
              <p className="text-sm text-text-muted">
                {t("home.bottomText")}
              </p>

              <AuthModal>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-1 text-sm font-bold"
                >
                  {t("home.bottomCta")}
                </Button>
              </AuthModal>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
