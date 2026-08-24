"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearchController } from "@/hooks/use-search-controller";
import { Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { BenefitsSection } from "@/components/benefits-section";
import { ContactCTA } from "@/components/contact-cta";
import { CategoryCarousel } from "@/components/category-carousel";
import { AuthModal } from "@/components/auth-modal";
import { UserProfile } from "@/models/types";
import { Categorywall } from "./categorywall";
import { ProviderProfileCard } from "@/components/profile/provider-profile-card";

export function HomeClient({
  initialProviders = [],
}: {
  initialProviders?: UserProfile[];
}) {
  const { user, profile, logout } = useAuth();
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
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-heading tracking-tight text-center text-gray-900 dark:text-white">
                  Pessoas da comunidade colocando talento em movimento
                </h3>
                <p className="mx-auto max-w-2xl text-base md:text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-50 lg:text-2xl">
                  Conheça membros que oferecem serviços, e ajudam outras famílias a encontrar soluções
                  confiáveis.
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
                  <Briefcase className="mx-auto mb-4 h-12 w-12 text-primary/40" />
                  <h4 className="text-xl font-bold text-text-main">
                    Ainda não encontramos alguém com esses filtros
                  </h4>
                  <p className="text-sm text-text-muted">
                    Tente buscar por uma categoria mais ampla ou remova a
                    localização para ver mais membros disponíveis.
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
                Seu talento também pode ajudar alguém hoje.
              </p>

              <AuthModal>
                <button
                  type="button"
                  className="bg-transparent font-bold text-primary hover:underline"
                >
                  Crie seu perfil na comunidade
                </button>
              </AuthModal>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
