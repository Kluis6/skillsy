"use client";

import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
  Zap,
  Trophy,
  Heart,
} from "lucide-react";
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
      bg: "bg-primary/5",
    },
    {
      title: "Visibilidade Total",
      description:
        "Tenha seu talento exposto para centenas de membros na sua ala, estaca e região.",
      icon: Zap,
      color: "text-accent",
      bg: "bg-accent/5",
    },
    {
      title: "Excelência Avaliada",
      description:
        "Sistema de avaliações anônimas que garante a qualidade e confiabilidade do serviço.",
      icon: Star,
      color: "text-highlight",
      bg: "bg-highlight/5",
    },
    {
      title: "Networking Real",
      description:
        "Construa uma rede de contatos profissionais sólida dentro de uma rede de confiança.",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  return (
    <section className="w-full h-full bg-surface py-24">
      <section className="px-4 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-text-main leading-tight mb-6">
                Por que fazer parte do{" "}
                <span className="text-primary italic">Skillsy?</span>
              </h2>
              <p className="text-lg text-text-muted leading-relaxed mb-8">
                O Skillsy não é apenas uma plataforma de serviços. É uma rede de
                confiança desenhada para fortalecer os laços profissionais e
                comunitários.
              </p>

              <div className="flex flex-col gap-4">
                <AuthModal>
                  <Button className="w-fit bg-primary text-white hover:bg-primary/90 rounded-2xl px-10 h-14 font-bold text-lg shadow-xl shadow-primary/20 group">
                    Criar minha conta agora
                    <ArrowRight
                      size={20}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </AuthModal>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">
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
                className={`p-8 rounded-[2rem] border border-border-subtle bg-white hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 group ${idx % 3 === 0 ? "md:col-span-1" : ""}`}
              >
                <div
                  className={`size-14 ${benefit.bg} ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-text-main mb-3">
                  {benefit.title}
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
