'use client';

import { motion } from 'motion/react';
import { ShieldCheck, Star, Users, ArrowRight, Zap, Trophy, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth-modal';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';

export default function JoinPage() {
  const { user, profile, logout } = useAuth();
  
  const benefits = [
    {
      title: 'Comunidade Segura',
      description: 'Conecte-se com profissionais que compartilham os mesmos princípios e valores que você. Nossa rede é exclusiva para membros de confiança.',
      icon: ShieldCheck,
      color: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      title: 'Visibilidade Total',
      description: 'Tenha seu talento exposto para centenas de membros na sua ala, estaca e região. Seja encontrado por quem realmente importa.',
      icon: Zap,
      color: 'text-accent',
      bg: 'bg-accent/5',
    },
    {
      title: 'Excelência Avaliada',
      description: 'Sistema de avaliações que garante a qualidade e confiabilidade do serviço. Receba feedback real de clientes satisfeitos.',
      icon: Star,
      color: 'text-highlight',
      bg: 'bg-highlight/5',
    },
    {
      title: 'Networking Real',
      description: 'Construa uma rede de contatos profissionais sólida. Troque experiências e cresça junto com outros talentos da comunidade.',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Selos de Mérito',
      description: 'Destaque-se com selos de verificação. Mostre seu comprometimento e ganhe o respeito instantâneo da rede.',
      icon: Trophy,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      title: 'Apoio Mútuo',
      description: 'Fortaleça a economia local. Cada serviço contratado aqui ajuda a prosperar um membro da nossa própria comunidade.',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-50',
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar user={user} profile={profile} logout={logout} />

      <main>
        {/* Page Hero */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-surface/20 rounded-bl-[10rem]" />
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                  <CheckCircle2 size={12} /> Junte-se à nossa rede de confiança
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-text-main leading-tight mb-8">
                  Sua jornada de <span className="text-primary italic">sucesso</span> começa aqui.
                </h1>
                <p className="text-xl text-text-muted leading-relaxed mb-10">
                  O Skillsy é a plataforma definitiva para conectar membros da comunidade aos melhores talentos locais. Transforme suas habilidades em oportunidades reais.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <AuthModal>
                    <Button className="w-full sm:w-fit bg-primary text-white hover:bg-primary/90 rounded-2xl px-10 h-16 font-bold text-lg shadow-2xl shadow-primary/20 group">
                      Começar Agora Gratuitamente
                      <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </AuthModal>
                  <Button variant="outline" className="w-full sm:w-fit border-border-subtle rounded-2xl px-10 h-16 font-bold text-lg hover:bg-surface">
                    Saiba Mais
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Informational Cards Section */}
        <section className="py-24 bg-surface/40">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-6">Tudo o que você ganha ao ser Skillsy</h2>
              <p className="text-text-muted">Desenvolvemos cada funcionalidade pensando em como potencializar sua visibilidade e segurança profissional.</p>
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
                  <div className={`w-16 h-16 ${benefit.bg} ${benefit.color} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform`}>
                    <benefit.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-main mb-4">{benefit.title}</h3>
                  <p className="text-text-muted leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* "How it works" Preview */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl font-black text-text-main leading-tight">
                  Pronto para <br />
                  <span className="text-accent underline decoration-4 underline-offset-8">fortalecer sua Ala?</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">1</div>
                    <p className="text-text-muted"><strong className="text-text-main">Crie seu perfil:</strong> Cadastre seus dados e descreva suas habilidades profissionais.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">2</div>
                    <p className="text-text-muted"><strong className="text-text-main">Seja descoberto:</strong> Membros da sua região encontrarão você através da nossa busca inteligente.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">3</div>
                    <p className="text-text-muted"><strong className="text-text-main">Cresça na rede:</strong> Realize serviços de qualidade, receba avaliações positivas e torne-se uma referência.</p>
                  </div>
                </div>
                <AuthModal>
                  <Button className="bg-text-main text-white hover:bg-text-main/90 rounded-2xl h-14 px-8 font-bold">
                    Cadastrar minha Skill hoje
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
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
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
             <h2 className="text-4xl font-black mb-6">A maior rede de talentos SUD está esperando por você.</h2>
             <p className="text-primary-foreground/80 text-lg mb-10">
               Milhares de membros já estão economizando tempo e fortalecendo laços através do Skillsy. Não fique de fora.
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
