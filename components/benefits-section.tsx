"use client";

import { motion } from "motion/react";
import { ShieldCheck, Star, Users, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

export function BenefitsSection() {
  const benefits = [
    {
      title: "Confiança antes do contato",
      description:
        "Encontre pessoas com rosto, história e vínculos reais com a comunidade.",
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary/10 text-primary",
    },
    {
      title: "Talentos com dignidade",
      description:
        "Mostre o que você sabe fazer de forma simples, clara e pronta para ser indicada.",
      icon: Zap,
      color: "text-sky-500 dark:text-white",
      bg: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    },
    {
      title: "Indicações que ajudam",
      description:
        "Avaliações e perfis públicos ajudam a transformar uma recomendação em decisão.",
      icon: Star,
      color: "text-yellow-500 dark:text-white",
      bg: "bg-highlight/10 text-highlight",
    },
    {
      title: "Apoio que fica perto",
      description:
        "Procure por cidade, região ou necessidade e fortaleça quem está ao seu redor.",
      icon: Users,
      color: "text-blue-500 dark:text-white",
      bg: "bg-primary/10 text-primary",
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
    <section className="w-full h-full bg-surface py-8 my-16">
      <section className="px-4 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={contentVariants}
              className="lg:space-y-12 space-y-8 text-center lg:text-start justify-center lg:items-start flex flex-col w-full"
            >
              <motion.div
                variants={itemVariants}
                className="space-y-2 will-change-transform"
              >
                <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-text-main leading-tight text-center lg:text-start">
                  Uma rede feita por pessoas,
                  <br className="" /> não por anúncios.
                </h2>
                <p className="text-base lg:text-lg text-text-muted leading-relaxed">
                  O Skillsy aproxima necessidades reais de talentos reais:
                  alguém que ensina, conserta, cozinha, atende, orienta ou
                  simplesmente sabe fazer bem feito.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col space-y-8 justify-center items-center w-full will-change-transform"
              >
                <AuthModal>
                  <Button
                    variant="default"
                    className="w-fit bg-primary text-white hover:bg-primary/90 border-0 rounded-full px-10 h-12 md:h-14 font-bold text-sm md:text-base lg:text-lg group"
                  >
                    Criar meu perfil na comunidade
                    <ArrowRight
                      size={20}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </AuthModal>
                <p className="text-xs font-bold text-text-muted uppercase tracking-normal text-center">
                  Cadastre sua skill para ser encontrado com mais confiança
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Bento Grid of Benefits */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={contentVariants}
            className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={`lg:p-8 md:p-6 p-4 flex flex-col space-y-4 md:space-y-6 rounded-xl border border-border-subtle bg-card transition-all hover:shadow-sm hover:shadow-primary/5 group ${idx % 3 === 0 ? "md:col-span-1" : ""}`}
              >
                <div
                  className={`size-12 md:size-14 xl:size-14  ${benefit.bg} ${benefit.color} rounded-md flex items-center justify-center  group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="lg:size-8 size-6" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-text-main">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </section>
  );
}
