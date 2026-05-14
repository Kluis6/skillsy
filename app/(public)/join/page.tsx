"use client";

import { motion } from "motion/react";
import {
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
  Zap,
  Trophy,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

import { Footer } from "@/components/footer";

export default function Page() {
  const benefits = [
    {
      title: "Confiança que Aproxima",
      description:
        "Conecte-se com pessoas que valorizam honestidade, respeito e bom atendimento em cada contato.",
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      title: "Visibilidade na Sua Região",
      description:
        "Mostre seu trabalho para pessoas da sua cidade e arredores que buscam indicações mais confiáveis.",
      icon: Zap,
      color: "text-accent",
      bg: "bg-accent/5",
    },
    {
      title: "Reputação com Experiência Real",
      description:
        "Receba avaliações de quem contratou você e ajude outros usuários a tomar decisões com mais segurança.",
      icon: Star,
      color: "text-highlight",
      bg: "bg-highlight/5",
    },
    {
      title: "Conexões que Continuam",
      description:
        "Mais do que fechar um serviço, você constrói relacionamentos profissionais que podem gerar novas oportunidades.",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Oportunidades para Servir & Prosperar",
      description:
        "Quem presta um bom serviço encontra espaço para crescer. Quem contrata encontra ajuda com mais proximidade e afinidade.",
      icon: Trophy,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Uma Comunidade Mais Forte",
      description:
        "Quando talentos locais se apoiam, todos ganham: profissionais, famílias e a comunidade ao redor.",
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <main className="mx-auto container px-4">
        {/* Page Hero */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-surface/20 rounded-bl-[10rem]" />
          <div className="">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                  <CheckCircle2 size={12} /> Cadastro gratuito para servir,
                  crescer e se conectar
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-text-main leading-tight mb-8">
                  Seu trabalho pode{" "}
                  <span className="text-primary italic">fortalecer</span> uma
                  comunidade inteira.
                </h1>
                <p className="text-xl text-text-muted leading-relaxed mb-10">
                  No Skillsy, você encontra e oferece serviços em um ambiente
                  guiado por confiança, respeito e apoio mútuo. Cadastre-se para
                  divulgar seu talento, encontrar pessoas com valores
                  semelhantes e criar conexões que fortalecem a vida prática de
                  todos.
                </p>
                <p className="text-sm text-text-muted leading-relaxed mb-10 max-w-2xl">
                  Iniciativa independente criada por membros da comunidade. O
                  Skillsy não é afiliado nem representa oficialmente A Igreja de
                  Jesus Cristo dos Santos dos Últimos Dias.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <AuthModal>
                    <Button className="w-full sm:w-fit bg-primary text-white hover:bg-primary/90 rounded-2xl px-10 h-16 font-bold text-lg shadow-2xl shadow-primary/20 group">
                      Criar Minha Conta
                      <ArrowRight
                        size={22}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </AuthModal>
                  <a
                    href="#como-funciona"
                    className="inline-flex w-full sm:w-fit items-center justify-center border border-border-subtle rounded-2xl px-10 h-16 font-bold text-lg hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Como Funciona
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Informational Cards Section */}
        <section className="py-24 bg-surface/40">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-6">
                Por que participar do Skillsy
              </h2>
              <p className="text-text-muted">
                Fazer parte do Skillsy ajuda você a encontrar oportunidades,
                contratar com mais confiança e manter o apoio circulando dentro
                da própria comunidade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border-subtle p-10 rounded-[3rem] hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                >
                  <div
                    className={`w-16 h-16 ${benefit.bg} ${benefit.color} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform`}
                  >
                    <benefit.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-main mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* "How it works" Preview */}
        <section id="como-funciona" className="py-32 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl font-black text-text-main leading-tight">
                  Pronto para <br />
                  <span className="text-accent underline decoration-4 underline-offset-8">
                    fazer parte?
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      1
                    </div>
                    <p className="text-text-muted">
                      <strong className="text-text-main">
                        Crie seu perfil:
                      </strong>{" "}
                      Apresente quem você é, o que você faz e como pode ajudar.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      2
                    </div>
                    <p className="text-text-muted">
                      <strong className="text-text-main">
                        Encontre ou seja encontrado:
                      </strong>{" "}
                      Procure profissionais de confiança ou deixe seu perfil
                      visível para novas oportunidades.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      3
                    </div>
                    <p className="text-text-muted">
                      <strong className="text-text-main">
                        Fortaleça sua reputação:
                      </strong>{" "}
                      Entregue um bom trabalho, receba avaliações e construa
                      confiança ao longo do tempo.
                    </p>
                  </div>
                </div>
                <AuthModal>
                  <Button className="bg-text-main text-white hover:bg-text-main/90 rounded-2xl h-14 px-8 font-bold">
                    Quero Participar
                  </Button>
                </AuthModal>
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-[4rem] p-10">
                  <div className="absolute inset-0 flex items-center justify-center text-primary/10 -z-10">
                    <Zap size={400} />
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-primary/5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        S
                      </div>
                      <h4 className="font-bold text-xl">Skillsy App</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-surface rounded-full" />
                      <div className="h-4 w-3/4 bg-surface rounded-full" />
                      <div className="h-20 w-full bg-surface/50 rounded-2xl mt-4 flex items-center justify-center">
                        <Star className="text-highlight" size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-primary text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-black mb-6">
              Trabalho, confiança e serviço também fortalecem a comunidade.
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10">
              Ao entrar no Skillsy, você ajuda a transformar habilidades em
              apoio real. Cada contratação bem-feita gera oportunidades,
              aproxima pessoas e fortalece uma rede de valores que beneficia
              todos.
            </p>
            <AuthModal>
              <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl px-12 h-16 font-bold text-xl shadow-2xl transition-transform hover:scale-105 active:scale-95">
                Fazer Parte do Skillsy
              </Button>
            </AuthModal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
