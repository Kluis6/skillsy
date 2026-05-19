"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Laptop,
  Palette,
  Megaphone,
  Briefcase,
  Utensils,
  Sparkles,
  Wrench,
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { LuArrowUpRight } from "react-icons/lu";

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
    name: "Cozinha",
    icon: Utensils,
    color: "text-blue-500",
    bg: "bg-surface",
  },
  { name: "Limpeza", icon: Sparkles, color: "text-blue-500", bg: "bg-surface" },
  {
    name: "Manutenção",
    icon: Wrench,
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

export function CategoryCarousel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", category);
    // Location is already in params if set by CepFilter
    router.push(`/search?${params.toString()}`);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full h-[80vh]">
      <div className="relative group container mx-auto px-4">
        <div className="flex justify-center items-center rounded-xl z-10 shadow-2xl object-fill bg-center h-[38vh] bg-[url(/Gemini_Generated_Image_esodutesodutesod.png)] ">
          <div className="absolute top-39 sm:top-40  space-y-2 md:space-y-4 w-[19rem] sm:w-lg md:w-2xl lg:w-4xl xl:w-6xl rounded-xl z-40 bg-white p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="w-full">
              <h3 className="text-base md:text-xl lg:text-2xl font-bold text-text-main font-heading tracking-tight text-center">
                Categoria mais populares
              </h3>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto  py-4  custom-scrollbar scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center justify-between space-y-6  min-w-[100px]  md:min-w-[140px] p-4 bg-white rounded-xl border hover:shadow-md transition-all duration-300 group/card shrink-0"
                >
                  <div
                    className={`size-12 md:size-14 lg:size-16 ${cat.bg} rounded-md flex items-center justify-center  group-hover/card:scale-110 transition-transform duration-300`}
                  >
                    <cat.icon className={`${cat.color}`} size={22} />
                  </div>

                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-100 group-hover/card:text-blue-700 dark:group-hover/card:text-white transition-colors">
                    {cat.name}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-center items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full size-8 border-border-subtle hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full size-8 border-border-subtle hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
