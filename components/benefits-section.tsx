"use client";

import { motion } from "motion/react";
import {  ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { FaStar } from "react-icons/fa6";
import { FaAward } from "react-icons/fa6";
import { FaUserTie } from "react-icons/fa";

export function BenefitsSection() {
  const benefits = [
    {
      title: "Relações de confiação",
      description:
        "Encontre pessoas com valores, história e vínculos reais com a comunidade.",
      icon: FaUserTie,
      color: "text-primary",
      bg: "bg-primary/10 text-primary",
    },
    {
      title: "Talentos com dignidade",
      description:
        "Mostre o que você sabe fazer de forma simples, clara e pronta para ser indicada.",
      icon: FaAward ,
      color: "text-sky-500 dark:text-white",
      bg: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    },
    {
      title: "Indicações que ajudam",
      description:
        "Avaliações e perfis públicos ajudam a transformar uma recomendação em decisão.",
      icon: FaStar,
      color: "text-yellow-500 dark:text-white",
      bg: "bg-highlight/10 text-highlight",
    },
  ];

  const sectionTransition = {
    type: "spring" as const,
    visualDuration: 0.72,
    bounce: 0.16,
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: sectionTransition,
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.985 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: sectionTransition,
    },
  };

  return (
    <section className="h-full w-full bg-[linear-gradient(175deg,color-mix(in_oklab,var(--skillsy-color-primary)_76%,var(--skillsy-color-primary-container))_40%,color-mix(in_oklab,var(--skillsy-color-primary)_70%,var(--skillsy-color-surface))_58%,var(--skillsy-color-surface)_100%)] py-12 dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--skillsy-color-primary)_52%,var(--skillsy-color-primary-container))_10%,color-mix(in_oklab,var(--skillsy-color-primary)_36%,var(--skillsy-color-surface))_52%,var(--skillsy-color-surface)_90%)]">
      <section className="px-4 container mx-auto">
        <div className="grid grid-cols-12 gap-y-10">
          {/* Left Side: Content */}
          <div className="col-span-12">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={contentVariants}
              className="lg:space-y-12 space-y-8 text-center lg:text-start justify-center lg:items-start flex flex-col w-full"
            ></motion.div>
            <motion.div
              variants={itemVariants}
              className="flex gap-4 will-change-transform"
            >
              <div className=" flex flex-col space-y-4">
                <h2 className="text-white text-xl md:text-3xl xl:text-2xl font-semibold text-center lg:text-start">
                  Uma rede feita por pessoas
                </h2>
                <p className="text-base lg:text-3xl text-white font-bold leading-relaxed w-full lg:w-3xl">
                  O Skillsy aproxima necessidades reais de talentos. Transforme
                  seu trabalho em novas oportunidades.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={contentVariants}
            className="col-span-12 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 lg:gap-6 md:gap-5 w-full will-change-transform gap-y-10"
          >
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={`lg:p-6 md:p-6 p-4 flex flex-row gap-4 rounded-xl bg-sky-950/60  shadow-sm  `}
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex flex-col gap-2">
                    <benefit.icon
                      className="md:size-16 size-10 drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                      fill={`url(#benefit-icon-gradient-${idx})`}
                    />
                    <svg
                      aria-hidden="true"
                      className="h-0 w-0 overflow-hidden"
                      focusable="false"
                    >
                      <defs>
                        <linearGradient
                          id={`benefit-icon-gradient-${idx}`}
                          gradientUnits="objectBoundingBox"
                          x1="0"
                          x2="1"
                          y1="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="34%" stopColor="#ffffff" />
                          <stop offset="68%" stopColor="#8ecfe6" />
                          <stop
                            offset="100%"
                            stopColor="var(--skillsy-color-primary)"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                    <h4 className="text-xl font-bold text-white">
                      {benefit.title}
                    </h4>
                  </div>
                  <div className="flex ">
                    <p className="text-sm text-gray-100 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-12 flex flex-col space-y-8 justify-center items-center w-full will-change-transform"
          >
            <AuthModal>
              <Button
                variant="default"
                className="w-fit bg-primary dark:text-black text-white hover:bg-primary/90 border-0 rounded-full px-10 h-12 md:h-14 font-bold text-sm md:text-base lg:text-lg group hover:shadow-2xl shadow-primary/50 transition-all flex items-center justify-center"
              >
                Criar meu perfil na comunidade
                <ArrowRight
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </AuthModal>
          </motion.div>
        </div>
      </section>
    </section>
  );
}

