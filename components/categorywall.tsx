"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Laptop,
  Palette,
  Megaphone,
  Briefcase,
  ShoppingBag,
  BookOpen,
  Utensils,
  Home,
  Sparkles,
  Sofa,
  Wrench,
  HardHat,
  Scissors,
  GraduationCap,
  Stethoscope,
  PartyPopper,
  Scale,
  Coins,
  Settings,
  Hammer,
  Car,
  Shirt,
  Heart,
  Dog,
  Camera,
  Music,
  Languages,
  Dumbbell,
  Cake,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Idiomas",
    icon: Languages,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Tecnologia",
    icon: Laptop,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  { name: "Design", icon: Palette, color: "text-blue-500", bg: "bg-surface" },
  {
    name: "Marketing",
    icon: Megaphone,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Consultoria",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Vendas",
    icon: ShoppingBag,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Aulas",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Cozinha",
    icon: Utensils,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  { name: "Doméstico", icon: Home, color: "text-blue-500", bg: "bg-surface" },
  { name: "Limpeza", icon: Sparkles, color: "text-blue-500", bg: "bg-surface" },
  {
    name: "Marcenaria",
    icon: Sofa,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Manutenção",
    icon: Wrench,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Construção",
    icon: HardHat,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  { name: "Beleza", icon: Scissors, color: "text-blue-500", bg: "bg-surface" },
  {
    name: "Educação",
    icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Saúde",
    icon: Stethoscope,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Eventos",
    icon: PartyPopper,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  { name: "Jurídico", icon: Scale, color: "text-blue-500", bg: "bg-surface" },
  {
    name: "Financeiro",
    icon: Coins,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Assistência",
    icon: Settings,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Reformas",
    icon: Hammer,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  { name: "Automotivo", icon: Car, color: "text-blue-500", bg: "bg-surface" },
  { name: "Moda", icon: Shirt, color: "text-blue-500", bg: "bg-surface" },
  { name: "Bem Estar", icon: Heart, color: "text-blue-500", bg: "bg-surface" },
  { name: "Pet Care", icon: Dog, color: "text-blue-500", bg: "bg-surface" },
  {
    name: "Fotografia",
    icon: Camera,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Música",
    icon: Music,
    color: "text-blue-500",
    bg: "bg-surface",
  },

  {
    name: "Esportes",
    icon: Dumbbell,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Festas",
    icon: Cake,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  {
    name: "Transporte",
    icon: Truck,
    color: "text-blue-500",
    bg: "bg-surface",
  },
];

export function Categorywall() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const mobileVisibleCount = 6;

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", category);
    // Location is already in params if set by CepFilter
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative z-10 mb-20 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center rounded-xl z-10 shadow-2xl object-fill bg-center h-[38vh] bg-[url(/Gemini_Generated_Image_esodutesodutesod.png)]" />

        <div className="-mt-24 md:-mt-20 lg:-mt-16 mx-4 md:mx-8 lg:mx-12 rounded-xl z-40 bg-card p-4 sm:p-6 md:p-8 shadow-2xl border border-border-subtle space-y-8 transition-all">
          <div className="w-full">
            <h3 className="text-xl lg:text-2xl font-bold text-text-main font-heading tracking-tight text-center">
              Categorias mais populares
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((cat, idx) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleCategoryClick(cat.name)}
                className={`${idx >= mobileVisibleCount && !showAllCategories ? "hidden lg:flex" : "flex"} flex-col items-center justify-center space-y-2 size-22 md:size-26 lg:size-32 p-2 md:p-4 bg-card rounded-xl border border-border-subtle hover:shadow-md transition-all duration-300 group/card`}
              >
                <div
                  className={`size-10 md:size-12 lg:size-16 ${cat.bg} rounded-md flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300`}
                >
                  <cat.icon className={`${cat.color} size-5 `} />
                </div>

                <p className="text-xs font-medium text-text-main group-hover/card:text-primary transition-colors">
                  {cat.name}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center lg:hidden">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAllCategories((current) => !current)}
              className="text-blue-500 hover:text-blue-600 active:text-blue-700 transition-colors"
            >
              {showAllCategories ? "Ver menos" : "Ver todas"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
