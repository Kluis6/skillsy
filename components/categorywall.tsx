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
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Tecnologia",
    icon: Laptop,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  { name: "Design", icon: Palette, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  {
    name: "Marketing",
    icon: Megaphone,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Consultoria",
    icon: Briefcase,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Vendas",
    icon: ShoppingBag,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Aulas",
    icon: BookOpen,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Cozinha",
    icon: Utensils,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  { name: "Doméstico", icon: Home, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  { name: "Limpeza", icon: Sparkles, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10 " },
  {
    name: "Marcenaria",
    icon: Sofa,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Manutenção",
    icon: Wrench,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Construção",
    icon: HardHat,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  { name: "Beleza", icon: Scissors, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  {
    name: "Educação",
    icon: GraduationCap,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Saúde",
    icon: Stethoscope,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Eventos",
    icon: PartyPopper,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  { name: "Jurídico", icon: Scale, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  {
    name: "Financeiro",
    icon: Coins,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Assistência",
    icon: Settings,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Reformas",
    icon: Hammer,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  { name: "Automotivo", icon: Car, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  { name: "Moda", icon: Shirt, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  { name: "Bem Estar", icon: Heart, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  { name: "Pet Care", icon: Dog, color: "text-primary dark:text-cyan-500", bg: "bg-cyan-700/10 bg-primary/10" },
  {
    name: "Fotografia",
    icon: Camera,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Música",
    icon: Music,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },

  {
    name: "Esportes",
    icon: Dumbbell,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Festas",
    icon: Cake,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
  },
  {
    name: "Transporte",
    icon: Truck,
    color: "text-primary dark:text-cyan-500",
    bg: "bg-cyan-700/10 bg-primary/10",
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
    <section className="relative z-10 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center z-10 shadow-sm object-fill bg-center h-[38vh] bg-[url(/Gemini_Generated_Image_esodutesodutesod.png)]" />

        <div className="-mt-24 md:-mt-20 lg:-mt-16 mx-4 md:mx-8 lg:mx-12 z-40 bg-card p-4 sm:p-6 md:p-8 shadow-sm  space-y-8 transition-all">
          <div className="w-full">
            <h3 className="text-xl lg:text-2xl font-bold text-text-main font-heading tracking-tight text-center">
               As categorias <br  /> mais populares
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
                className={`${idx >= mobileVisibleCount && !showAllCategories ? "hidden lg:flex" : "flex"} flex-col items-center justify-center space-y-2 size-22 md:size-26 lg:size-32 p-2 md:p-4 bg-card border  hover:shadow-md transition-all duration-300 group/card`}
              >
                <div
                  className={`size-10 md:size-12 lg:size-16 ${cat.bg} flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300`}
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
              variant="default"
              size="lg"
              onClick={() => setShowAllCategories((current) => !current)}
              className="text-white"
            >
              {showAllCategories ? "Ver menos" : "Ver todas"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
