"use client";

import { motion } from "motion/react";
import { ShieldCheck, Star, Users, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

export function BenefitsSection() {
  const benefits = [
    {
      title: "Comunidade Segura",
      description:
        "Conecte-se com profissionais que compartilham os mesmos princípios e valores que você.",
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Visibilidade Total",
      description:
        "Tenha seu talento exposto para centenas de membros na sua ala, estaca e região.",
      icon: Zap,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Excelência Avaliada",
      description:
        "Sistema de avaliações anônimas que garante a qualidade e confiabilidade do serviço.",
      icon: Star,
      color: "text-highlight",
      bg: "bg-highlight/10",
    },
    {
      title: "Networking Real",
      description:
        "Construa uma rede de contatos profissionais sólida dentro de uma rede de confiança.",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
  ];

  return (
    <section className="w-full h-full bg-surface py-8 my-16">
      <section className="px-4 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:space-y-12 space-y-8 text-center lg:text-start justify-center lg:items-start flex flex-col w-full"
            >
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-text-main leading-tight text-center lg:text-start">
                  Por que fazer <br className="hidden lg:flex" /> parte da
                  <span className="text-primary"> Skillsy ?</span>
                </h2>
                <p className="text-base lg:text-lg text-text-muted leading-relaxed">
                  O Skillsy não é apenas uma plataforma de serviços. É uma rede
                  de confiança desenhada para fortalecer os laços profissionais
                  e comunitários.
                </p>
              </div>

              <div className="flex flex-col space-y-8 justify-center items-center w-full">
                <AuthModal>
                  <Button
                    variant="default"
                    className="w-fit bg-primary text-white hover:shadow-2xl shadow-primary border-0 rounded-full px-10 h-10 md:h-14 font-bold text-sm md:text-base lg:text-lg group"
                  >
                    Criar minha conta agora
                    <ArrowRight
                      size={20}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </AuthModal>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest text-center">
                  Junte-se a centenas de membros já cadastrados
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Bento Grid of Benefits */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`lg:p-8 md:p-6 p-4 flex flex-col space-y-4 md:space-y-6 rounded-xl border border-border-subtle bg-white transition-all hover:shadow-xl hover:shadow-primary/5 group ${idx % 3 === 0 ? "md:col-span-1" : ""}`}
              >
                <div
                  className={`size-12 md:size-14 xl:size-14 ${benefit.bg} ${benefit.color} rounded-md flex items-center justify-center  group-hover:scale-110 transition-transform duration-300`}
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
          </div>
        </div>
      </section>
    </section>
  );
}
