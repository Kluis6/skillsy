"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearchController } from "@/hooks/use-search-controller";
import { useContactsController } from "@/hooks/use-contacts-controller";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Briefcase, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { BenefitsSection } from "@/components/benefits-section";
import { ContactCTA } from "@/components/contact-cta";
import { CategoryCarousel } from "@/components/category-carousel";
import { AuthModal } from "@/components/auth-modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/models/types";
import Image from "next/image";

export function HomeClient({
  initialProviders = [],
}: {
  initialProviders?: UserProfile[];
}) {
  const router = useRouter();
  const { user, profile, logout, loading, toggleContact } = useAuth();
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

  const { savedContacts } = useContactsController(profile, activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center mb-20">
            <Skeleton className="h-4 w-32 mx-auto mb-6 rounded-full" />
            <Skeleton className="h-16 w-full mb-6 rounded-2xl" />
            <Skeleton className="h-16 w-3/4 mx-auto mb-10 rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Navbar
        user={user}
        profile={profile}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searching={searching}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
      />

      {/* Categories Carousel */}
      <CategoryCarousel />

      {!user && <BenefitsSection />}

      {/* Main Content */}
      <main className="container mx-auto px-4 my-12">
        <AnimatePresence mode="wait">
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-text-main mb-4">
                Membros em Destaque
              </h3>
              <p className="text-text-muted">
                Conheça os profissionais mais bem avaliados da nossa rede.
              </p>
            </div>

            {providers.length > 0 ? (
              <div className="grid grid-cols-12 gap-4 md:gap-8">
                {providers.map((p, idx) => (
                  <motion.div
                    key={p.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="col-span-12 md:col-span-6 xl:col-span-4"
                  >
                    <Card className="relative mx-auto w-full h-fit bg-white pt-0">
                      <div className="relative w-full h-40">
                        <div className="absolute inset-0 z-30 h-40 bg-black/25" />
                        <Image
                          src={p.bannerURL ? p.bannerURL : ""}
                          alt="Event cover"
                          fill
                          className=" z-20 aspect-auto h-full w-full  object-cover"
                        />
                        <div className="flex items-center gap-1 text-base font-bold text-highlight z-30 absolute right-4 top-4 drop-shadow-xl">
                          <Star size={16} fill="currentColor" />{" "}
                          {p.rating || "0.0"}
                        </div>
                        <div className="absolute z-30 bottom-4 left-4">
                          {p.companyName && (
                            <p className="text-sm font-bold text-white  uppercase tracking-wider drop-shadow-xl">
                              {p.companyName}
                            </p>
                          )}
                        </div>
                      </div>

                      <CardHeader>
                        <section className="flex gap-4 items-center ">
                          <Avatar className="size-14">
                            <AvatarImage src={p.photoURL} />
                            <AvatarFallback className="bg-surface text-primary font-bold text-xl">
                              {p.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <CardTitle className="text-xl flex justify-start gap-x-2 items-center font-bold text-text-main">
                              {p.name}
                              {p.verifiedMember && (
                                <ShieldCheck className="size-5 text-blue-500" />
                              )}
                            </CardTitle>
                            <CardDescription className=" flex items-center gap-1">
                              <MapPin size={12} /> {p.location || "Brasil"}
                            </CardDescription>
                          </div>
                        </section>

                        <CardAction>
                          <Badge className="bg-surface text-blue-500 font-normal">
                            {p.category || "Geral"}
                          </Badge>
                        </CardAction>
                      </CardHeader>

                      <CardContent className="flex-grow text-sm">
                        <p className="text-text-muted leading-relaxed line-clamp-3 mb-4">
                          {p.bio ||
                            "Membro dedicado da comunidade oferecendo serviços com excelência e valores compartilhados."}
                        </p>
                      </CardContent>

                      <CardFooter>
                        <Link
                          href={`/profile/${p.uid}`}
                          className="w-full text-center font-medium text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-sm h-10 flex justify-center items-center"
                        >
                          Ver Detalhes
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-surface/30 rounded-3xl border-2 border-dashed border-border-subtle">
                <Briefcase className="mx-auto h-12 w-12 text-text-muted/20 mb-4" />
                <h4 className="text-xl font-bold text-text-main">
                  Nenhum resultado
                </h4>
                <p className="text-sm text-text-muted">
                  Tente ajustar seus filtros de busca.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA Section */}
        <ContactCTA />

        <div className="mt-16 text-center text-sm text-text-muted">
          Possui uma empresa ou presta serviços?{" "}
          {user ? (
            !profile?.isProvider && (
              <strong className="text-accent cursor-pointer hover:underline">
                Cadastre sua Skill agora
              </strong>
            )
          ) : (
            <AuthModal>
              <button className="text-accent font-bold cursor-pointer hover:underline bg-transparent border-none p-0">
                Cadastre sua Skill agora
              </button>
            </AuthModal>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
