"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { FaStar } from "react-icons/fa6";
import { FaAward } from "react-icons/fa6";
import { FaUserTie } from "react-icons/fa";

export function BenefitsSection() {
  const benefits = [
    {
      title: "Relações de confiança",
      description:
        "Encontre pessoas com valores, história e vínculos reais com a comunidade.",
      icon: FaUserTie,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Talentos com dignidade",
      description:
        "Mostre o que você sabe fazer de forma simples, clara e pronta para ser indicada.",
      icon: FaAward,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Indicações que ajudam",
      description:
        "Avaliações e perfis públicos ajudam a transformar uma recomendação em decisão.",
      icon: FaStar,
      color: "text-primary",
      bg: "bg-primary/10",
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
    <section className="w-full border-y bg-accent py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-y-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={contentVariants}
            className="col-span-12 flex w-full flex-col items-center justify-center space-y-4 text-center lg:items-start lg:text-start"
          >
            <motion.div
              variants={itemVariants}
              className="flex gap-4 will-change-transform"
            >
              <div className="flex max-w-3xl flex-col space-y-4">
                <h2 className="font-heading text-xl font-semibold text-gray-900 md:text-3xl dark:text-white">
                  Uma rede feita por pessoas
                </h2>
                <p className="text-lg font-semibold leading-relaxed text-gray-600 dark:text-gray-50 md:text-2xl">
                  O Skillsy aproxima necessidades reais de talentos. Transforme
                  seu trabalho em novas oportunidades.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={contentVariants}
            className="col-span-12 grid w-full grid-cols-1 gap-4 will-change-transform md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={cardVariants}
                className="flex bg-card border relative "
              >
                <div
                  className={`h-full w-1/3 flex justify-center items-center ${benefit.bg}`}
                >
                  <benefit.icon
                    className={`size-7 ${benefit.color}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-2 p-4 md:p-6 lg:p-8">
                  <h4 className="font-heading text-xl font-bold text-text-main">
                    {benefit.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-12 flex w-full flex-col items-center justify-center space-y-8 will-change-transform"
          >
            <AuthModal>
              <Button
                variant="default"
                className="group flex h-12 w-fit items-center justify-center  border-0 bg-primary px-6 text-sm font-bold transition-colors hover:bg-primary/90 md:h-14 md:px-8 md:text-base"
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
      </div>
    </section>
  );
}
