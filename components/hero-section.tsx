"use client";

import Form from "next/form";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CepFilter } from "@/components/cep-filter";

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // handleSearch removed as Form handles it via action
  searching: boolean;
  locationFilter: { city: string; state: string } | null;
  setLocationFilter: (loc: { city: string; state: string } | null) => void;
}

export function HeroSection({
  searchTerm,
  setSearchTerm,
  searching,
  locationFilter,
  setLocationFilter,
}: HeroSectionProps) {
  return (
    <section className="w-full h-[70vh]">
      <div className="container mx-auto space-y-4 flex flex-col justify-center items-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4 text-center"
        >
          <h2 className="font-black text-primary lg:text-9xl md:text-7xl text-5xl tracking-tighter">
            Skillsy
          </h2>
          <p className="text-text-main text-sm font-medium md:text-base">
            Onde talentos encontram oportunidades
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <Form
            action="/search"
            className="flex flex-col w-full space-y-6 justify-center items-center"
          >
            <div className="relative w-full md:w-2xl flex justify-center items-center">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
                size={20}
              />
              <Input
                name="q"
                placeholder="O que você procura? Pintor, Advogado, Bolo de Pote..."
                className="pl-12 h-12 w-full placeholder:text-gray-400"
                defaultValue={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <p className="text-xs font-normal text-text-muted tracking-widest">
              Localização atual:{" "}
              <span className="text-blue-700 font-medium">
                {locationFilter
                  ? `${locationFilter.city}, ${locationFilter.state}`
                  : "Todo o Brasil"}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 ">
              <CepFilter onLocationChange={setLocationFilter} />
              <Button
                type="submit"
                variant="default"
                className="py-5 px-7 bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              >
                {searching ? "Pesquisando..." : "Pesquisar"}
              </Button>
            </div>
          </Form>
        </motion.div>
      </div>
    </section>
  );
}
