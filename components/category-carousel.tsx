"use client";

import { useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";


const categories = [
  {
    name: "Idiomas",
    icon: Languages,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Tecnologia",
    icon: Laptop,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  { name: "Design", icon: Palette, color: "text-primary", bg: "bg-cyan-700/10" },
  {
    name: "Marketing",
    icon: Megaphone,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Consultoria",
    icon: Briefcase,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Vendas",
    icon: ShoppingBag,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Aulas",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Cozinha",
    icon: Utensils,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  { name: "Doméstico", icon: Home, color: "text-primary", bg: "bg-cyan-700/10" },
  { name: "Limpeza", icon: Sparkles, color: "text-primary", bg: "bg-cyan-700/10" },
  {
    name: "Marcenaria",
    icon: Sofa,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Manutenção",
    icon: Wrench,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Construção Civil",
    icon: HardHat,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  { name: "Beleza", icon: Scissors, color: "text-primary", bg: "bg-cyan-700/10" },
  {
    name: "Educação",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Saúde",
    icon: Stethoscope,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Eventos",
    icon: PartyPopper,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  { name: "Jurídico", icon: Scale, color: "text-primary", bg: "bg-cyan-700/10" },
  {
    name: "Financeiro",
    icon: Coins,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Assistência",
    icon: Settings,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Reformas",
    icon: Hammer,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  { name: "Automotivo", icon: Car, color: "text-primary", bg: "bg-cyan-700/10" },
  { name: "Moda", icon: Shirt, color: "text-primary", bg: "bg-cyan-700/10" },
  { name: "Bem Estar", icon: Heart, color: "text-primary", bg: "bg-cyan-700/10" },
  { name: "Pet Care", icon: Dog, color: "text-primary", bg: "bg-cyan-700/10" },
  {
    name: "Fotografia",
    icon: Camera,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Música",
    icon: Music,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },

  {
    name: "Esportes",
    icon: Dumbbell,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Festas",
    icon: Cake,
    color: "text-primary",
    bg: "bg-cyan-700/10",
  },
  {
    name: "Transporte",
    icon: Truck,
    color: "text-primary",
    bg: "bg-cyan-700/10",
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
    <div className="w-full h-[65vh] sm:h-[70vh] lg:h-[78vh] relative hidden md:block">
      <div className="relative group container mx-auto px-4">
        <div className="flex justify-center items-center  z-10 shadow-sm object-fill bg-center h-[38vh] bg-[url(/Gemini_Generated_Image_esodutesodutesod.png)]">
          <div className="absolute top-[calc(100%-6rem)] z-40 w-[calc(100%-4rem)] space-y-2 border border-border bg-card p-4 text-card-foreground shadow-xl md:w-[calc(100%-6rem)] md:space-y-4 md:p-8 lg:w-[calc(100%-8rem)]">
            <div className="w-full">
              <h3 className="text-center font-heading text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                As categorias mais populares
              </h3>
     
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto py-4 custom-scrollbar scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group/card flex min-w-[100px] shrink-0 flex-col items-center justify-between space-y-6 border border-border bg-card p-4 text-card-foreground transition-all duration-300 hover:bg-muted hover:shadow-md md:min-w-[140px]"
                >
                  <div
                    className={`size-12 md:size-14 lg:size-16 ${cat.bg} dark:bg-cyan-400/10 flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110`}
                  >
                    <cat.icon className={`${cat.color}`} size={22} />
                  </div>

                  <span className="text-xs md:text-sm font-medium group-hover/card:text-primary transition-colors">
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
                  className=" size-8  hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className=" size-8  hover:bg-primary/5 hover:text-primary transition-all"
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

