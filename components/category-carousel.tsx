'use client';

import React, { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

const categories = [
  { name: 'Tecnologia', icon: Laptop, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Design', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
  { name: 'Marketing', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Consultoria', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Cozinha', icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Limpeza', icon: Sparkles, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { name: 'Manutenção', icon: Wrench, color: 'text-slate-500', bg: 'bg-slate-50' },
  { name: 'Beleza', icon: Scissors, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Educação', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Saúde', icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Eventos', icon: PartyPopper, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Jurídico', icon: Scale, color: 'text-gray-600', bg: 'bg-gray-100' },
  { name: 'Financeiro', icon: Coins, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { name: 'Assistência', icon: Settings, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Reformas', icon: Hammer, color: 'text-orange-700', bg: 'bg-orange-100' },
  { name: 'Automotivo', icon: Car, color: 'text-red-700', bg: 'bg-red-100' },
  { name: 'Moda', icon: Shirt, color: 'text-pink-700', bg: 'bg-pink-100' },
  { name: 'Bem Estar', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
  { name: 'Pet Care', icon: Dog, color: 'text-amber-700', bg: 'bg-amber-100' },
  { name: 'Fotografia', icon: Camera, color: 'text-zinc-700', bg: 'bg-zinc-100' },
  { name: 'Música', icon: Music, color: 'text-violet-600', bg: 'bg-violet-100' },
  { name: 'Idiomas', icon: Languages, color: 'text-sky-600', bg: 'bg-sky-100' },
  { name: 'Esportes', icon: Dumbbell, color: 'text-lime-600', bg: 'bg-lime-100' },
  { name: 'Festas', icon: Cake, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  { name: 'Transporte', icon: Truck, color: 'text-teal-600', bg: 'bg-teal-100' },
];

export function CategoryCarousel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', category);
    // Location is already in params if set by CepFilter
    router.push(`/search?${params.toString()}`);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group max-w-7xl mx-auto px-4 md:px-8 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-text-main font-heading tracking-tight">Explorar por Categoria</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-8 h-8 border-border-subtle hover:bg-primary/5 hover:text-primary transition-all"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-8 h-8 border-border-subtle hover:bg-primary/5 hover:text-primary transition-all"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat, idx) => (
          <motion.button
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleCategoryClick(cat.name)}
            className="flex flex-col items-center justify-center min-w-[100px] md:min-w-[120px] p-4 bg-card rounded-3xl border border-border-subtle hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group/card shrink-0"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform duration-300`}>
              <cat.icon className={`${cat.color}`} size={24} />
            </div>
            <span className="text-xs md:text-sm font-bold text-text-main group-hover/card:text-primary transition-colors">
              {cat.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
