'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export function PrivacyClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-black text-text-main mb-6 font-heading tracking-tighter uppercase">
              Política de <span className="text-primary">Privacidade.</span>
            </h1>
            <p className="text-xl text-text-muted leading-relaxed max-w-2xl">
              Na Skillsy, tratamos seus dados com o mesmo respeito e integridade que regem nossa comunidade. Como uma iniciativa sem fins lucrativos, nosso único interesse é fortalecer sua rede de contatos profissionais.
            </p>
          </motion.div>

          {/* Destaque de Compromisso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
              <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Zero Comércio</span>
              <p className="text-text-muted text-sm leading-relaxed">Jamais venderemos seus dados ou usaremos suas informações para fins publicitários externos.</p>
            </div>
            <div className="bg-highlight/5 border border-highlight/10 rounded-3xl p-6">
              <span className="text-highlight font-bold text-xs uppercase tracking-widest block mb-2">Segurança Ativa</span>
              <p className="text-text-muted text-sm leading-relaxed">Seus dados são protegidos pela robusta infraestrutura do Google Firebase, com criptografia de ponta.</p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-3xl p-6">
              <span className="text-text-main font-bold text-xs uppercase tracking-widest block mb-2">Controle Total</span>
              <p className="text-text-muted text-sm leading-relaxed">Você decide o que mostrar e pode excluir sua conta e dados permanentemente a qualquer momento.</p>
            </div>
          </div>

          <div className="space-y-12 bg-card rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border-subtle relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            
            <section className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Lock size={20} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-text-main">Transparência na Coleta</h2>
              </div>
              <p className="text-text-muted leading-relaxed">
                Coletamos apenas o <strong>mínimo necessário</strong> para que a plataforma funcione. Isso inclui:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-text-muted text-sm border-l-2 border-primary/20 ml-2 py-1">
                <li><strong>Identificação:</strong> Nome e foto (para que os membros saibam com quem falam).</li>
                <li><strong>Contato:</strong> WhatsApp e E-mail (essencial para que as &quot;Skills&quot; sejam contratadas).</li>
                <li><strong>Localização:</strong> Cidade e Estado (para organizar a rede geográfica de ajuda).</li>
                <li><strong>Perfil Profissional:</strong> Biografia, categoria e especialidades (para dar visibilidade ao seu trabalho).</li>
              </ul>
            </section>

            <section className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-highlight/10 rounded-xl flex items-center justify-center text-highlight">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-text-main">Como Cuidamos do Uso</h2>
              </div>
              <p className="text-text-muted leading-relaxed mb-4">
                Suas informações nunca saem do ecossistema Skillsy sem sua permissão. O uso é restrito para:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-surface rounded-2xl text-xs text-text-muted border border-border-subtle">
                  Facilitar a busca por profissionais qualificados dentro da comunidade.
                </div>
                <div className="p-4 bg-surface rounded-2xl text-xs text-text-muted border border-border-subtle">
                  Permitir a comunicação direta via WhatsApp entre membros.
                </div>
                <div className="p-4 bg-surface rounded-2xl text-xs text-text-muted border border-border-subtle">
                  Gerar estatísticas anônimas para melhorar a rede (ex: &quot;temos 50 eletricistas&quot;).
                </div>
                <div className="p-4 bg-surface rounded-2xl text-xs text-text-muted border border-border-subtle">
                  Verificar a autenticidade dos perfis para evitar fraudes ou spam.
                </div>
              </div>
            </section>

            <section className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-text-main">Compromisso com a Segurança</h2>
              </div>
              <div className="prose prose-slate max-w-none text-text-muted leading-relaxed text-sm space-y-4">
                <p>
                  Embora sejamos uma plataforma comunitária, levamos a segurança a sério. Utilizamos autenticação via Google para garantir que as identidades sejam reais e armazenamos todos os dados seguindo as normas da **LGPD (Lei Geral de Proteção de Dados)**.
                </p>
                <p>
                  Suas interações e curtidas (contatos salvos) são privadas e servem apenas para organizar sua experiência pessoal no site.
                </p>
              </div>
            </section>

            <section className="relative z-10 border-t border-border-subtle pt-8 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-text-main">
                  <FileText size={20} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-text-main">Seus Direitos e Escolhas</h2>
              </div>
              <p className="text-text-muted leading-relaxed text-sm">
                Você tem o &quot;Direito ao Esquecimento&quot;. Se optar por sair da Skillsy, ao excluir sua conta, removeremos todos os seus dados pessoais de nossa base de dados ativa permanentemente. Para retificar ou acessar seus dados, basta acessar seu painel de perfil.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-10 border-t border-border-subtle text-center">
            <p className="text-text-muted text-xs uppercase tracking-widest font-bold">
              Última atualização: 17 de Abril de 2026
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
