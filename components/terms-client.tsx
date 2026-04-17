'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ShieldCheck, Info, HelpingHand, AlertTriangle, Church } from 'lucide-react';
import { motion } from 'motion/react';

export function TermsClient() {
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
              Termos de <span className="text-primary">Uso.</span>
            </h1>
            <p className="text-xl text-text-muted leading-relaxed">
              Bem-vindo ao Skillsy. Ao utilizar nossa plataforma, você concorda em cumprir estes termos e condições que visam manter a segurança e a integridade da nossa comunidade.
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Seção 1: Independência */}
            <section className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border-subtle relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Church size={24} />
                </div>
                <h2 className="text-2xl font-bold text-text-main font-heading">Independência Institucional</h2>
              </div>
              <div className="prose prose-slate max-w-none text-text-muted leading-relaxed space-y-4">
                <p>
                  A <strong>Skillsy</strong> é uma plataforma independente criada e gerida por membros da comunidade, com o objetivo de promover o apoio mútuo e o empreendedorismo local. 
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-100 font-medium">
                  <strong>AVISO IMPORTANTE:</strong> Esta plataforma <strong>NÃO</strong> é um braço oficial, departamento ou site controlado por <strong>A Igreja de Jesus Cristo dos Santos dos Últimos Dias</strong>. Não possuímos vínculo institucional, jurídico ou financeiro com a Igreja.
                </div>
              </div>
            </section>

            {/* Seção 2: Responsabilidade */}
            <section className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border-subtle">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <h2 className="text-2xl font-bold text-text-main font-heading">Isenção de Responsabilidade</h2>
              </div>
              <div className="prose prose-slate max-w-none text-text-muted leading-relaxed space-y-4">
                <p>
                  A Skillsy atua exclusivamente como um <strong>diretório de conexões</strong>. Facilitamos o encontro entre quem precisa de um serviço e quem o oferece dentro da comunidade.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Não Garantimos Qualidade:</strong> A plataforma não avalia tecnicamente nem certifica os serviços prestados. A escolha e contratação são de inteira responsabilidade do usuário.</li>
                  <li><strong>Contratos Privados:</strong> Qualquer contrato, acordo ou transação financeira é feito estritamente entre o prestador e o cliente, sem qualquer intermediação ou comissão da Skillsy.</li>
                  <li><strong>Danos e Prejuízos:</strong> A plataforma não se responsabiliza por eventuais danos, atrasos, vícios ou problemas decorrentes dos serviços contratados por meio do site.</li>
                </ul>
              </div>
            </section>

            {/* Seção 3: Conduta */}
            <section className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border-subtle">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-bold text-text-main font-heading">Código de Conduta</h2>
              </div>
              <p className="text-text-muted leading-relaxed mb-6">
                Esperamos que todos os usuários ajam de acordo com os princípios de integridade e honestidade que caracterizam nossa comunidade.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface rounded-2xl border border-border-subtle">
                  <span className="font-bold text-text-main block mb-1">Honestidade</span>
                  <span className="text-sm">Forneça informações verdadeiras sobre suas qualificações e preços.</span>
                </div>
                <div className="p-4 bg-surface rounded-2xl border border-border-subtle">
                  <span className="font-bold text-text-main block mb-1">Respeito</span>
                  <span className="text-sm">Mantenha comunicações cordiais e profissionais com todos os membros.</span>
                </div>
                <div className="p-4 bg-surface rounded-2xl border border-border-subtle">
                  <span className="font-bold text-text-main block mb-1">Integridade</span>
                  <span className="text-sm">Cumpra os acordos firmados e horários estabelecidos.</span>
                </div>
                <div className="p-4 bg-surface rounded-2xl border border-border-subtle">
                  <span className="font-bold text-text-main block mb-1">Segurança</span>
                  <span className="text-sm">Nunca utilize a plataforma para atividades ilícitas ou impróprias.</span>
                </div>
              </div>
            </section>

            {/* Seção 4: Outros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                <div className="flex items-center gap-3 mb-4">
                  <Info size={20} className="text-primary" />
                  <h3 className="font-bold text-text-main font-heading">Privacidade</h3>
                </div>
                <p className="text-text-muted text-sm px-1 leading-relaxed">
                  Seus dados são utilizados apenas para a finalidade de conexão profissional. Não vendemos suas informações para terceiros. Respeitamos a LGPD (Lei Geral de Proteção de Dados).
                </p>
              </section>
              <section className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                <div className="flex items-center gap-3 mb-4">
                  <HelpingHand size={20} className="text-primary" />
                  <h3 className="font-bold text-text-main font-heading">Modificações</h3>
                </div>
                <p className="text-text-muted text-sm px-1 leading-relaxed">
                  Estes termos podem ser atualizados periodicamente para refletir melhorias na plataforma. O uso continuado do serviço após alterações implica em aceitação dos novos termos.
                </p>
              </section>
            </div>
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
