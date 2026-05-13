'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  FileText,
  Info,
  Mail,
  RefreshCcw,
  Scale,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const quickPoints = [
  {
    eyebrow: 'Conexões',
    text: 'A Skillsy aproxima quem precisa de um serviço e quem deseja oferecê-lo.',
    tone: 'bg-primary/5 border-primary/10 text-primary',
  },
  {
    eyebrow: 'Sem Intermediação',
    text: 'Pagamentos, contratos e combinados são feitos diretamente entre as partes.',
    tone: 'bg-amber-50 border-amber-100 text-amber-700',
  },
  {
    eyebrow: 'Responsabilidade',
    text: 'A plataforma não emprega, certifica, supervisiona ou garante os serviços anunciados.',
    tone: 'bg-surface border-border-subtle text-text-main',
  },
];

const sectionLinks = [
  { href: '#independencia', label: 'Independência' },
  { href: '#funcionamento', label: 'Como Funciona' },
  { href: '#responsabilidades', label: 'Responsabilidades' },
  { href: '#conduta', label: 'Conduta' },
  { href: '#privacidade', label: 'Privacidade' },
  { href: '#atualizacoes', label: 'Atualizações' },
];

export function TermsClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-12 shadow-sm"
          >
            <div className="absolute top-0 right-0 h-52 w-52 rounded-full bg-primary/8 blur-3xl" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
                <FileText size={14} />
                Termos da Plataforma
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-text-main mb-6 font-heading tracking-tight">
                Termos de <span className="text-primary">Uso</span>
              </h1>
              <p className="text-lg md:text-xl text-text-muted leading-relaxed">
                Estes termos explicam como a Skillsy funciona, o que você pode
                esperar da plataforma e quais responsabilidades continuam sendo
                suas ao contratar ou oferecer serviços.
              </p>
              <p className="text-sm md:text-base text-text-muted leading-relaxed mt-5 max-w-2xl">
                Ao acessar ou usar a Skillsy, você concorda com estas regras. Se
                não concordar com elas, recomendamos não utilizar a plataforma.
              </p>
            </div>
          </motion.section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {quickPoints.map((point) => (
              <div
                key={point.eyebrow}
                className={`rounded-[2rem] border p-6 ${point.tone}`}
              >
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
                  {point.eyebrow}
                </span>
                <p className="text-sm leading-relaxed text-text-muted">
                  {point.text}
                </p>
              </div>
            ))}
          </section>

          <nav
            aria-label="Seções dos termos"
            className="mt-10 flex flex-wrap gap-3"
          >
            {sectionLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-main transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-8">
            <section
              id="independencia"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Scale size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main font-heading">
                    Independência Institucional
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    A <strong>Skillsy</strong> é uma iniciativa independente,
                    criada para facilitar conexões profissionais e apoio mútuo
                    entre membros da comunidade.
                  </p>
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-blue-900">
                    <strong>Aviso importante:</strong> a Skillsy não é afiliada,
                    administrada, patrocinada nem endossada oficialmente por
                    <strong> A Igreja de Jesus Cristo dos Santos dos Últimos Dias</strong>.
                    Também não representa alas, estacas, unidades locais ou
                    departamentos da Igreja.
                  </div>
                </div>
              </div>
            </section>

            <section
              id="funcionamento"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Info size={24} />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-text-main font-heading">
                    Como a Skillsy Funciona
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    A Skillsy atua como um diretório de conexões. A plataforma
                    ajuda usuários a apresentar seus serviços, encontrar
                    profissionais e iniciar contato com mais facilidade.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <h3 className="font-bold text-text-main mb-2">
                        1. Perfil
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        Você informa seus dados, sua área de atuação e como pode
                        ajudar outras pessoas.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <h3 className="font-bold text-text-main mb-2">
                        2. Conexão
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        Outros usuários podem encontrar seu perfil e entrar em
                        contato de forma direta.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <h3 className="font-bold text-text-main mb-2">
                        3. Combinados
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        Serviço, valores, prazos e condições são acertados
                        exclusivamente entre cliente e prestador.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="responsabilidades"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main font-heading">
                    Responsabilidades & Limites da Plataforma
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-relaxed text-text-muted">
                    <li>
                      A Skillsy não emprega, representa, seleciona, supervisiona
                      ou certifica tecnicamente os profissionais anunciados.
                    </li>
                    <li>
                      A Skillsy não intermedeia pagamentos, não participa dos
                      contratos privados e não cobra comissão sobre negociações
                      feitas entre usuários.
                    </li>
                    <li>
                      A escolha de contratar, pagar, aceitar orçamento ou iniciar
                      qualquer prestação de serviço é de inteira responsabilidade
                      das partes envolvidas.
                    </li>
                    <li>
                      Avaliações, descrições de perfil e informações comerciais
                      são fornecidas pelos próprios usuários e podem ser revistas
                      ou removidas quando violarem estas regras.
                    </li>
                    <li>
                      A Skillsy não se responsabiliza por atrasos, prejuízos,
                      defeitos, promessas não cumpridas, perdas financeiras ou
                      danos decorrentes de acordos celebrados entre usuários.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="conduta"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <ShieldCheck size={24} />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-text-main font-heading">
                    Conduta Esperada dos Usuários
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    Esperamos que todo usuário aja com honestidade, respeito e
                    responsabilidade ao usar a plataforma.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <span className="font-bold text-text-main block mb-1">
                        Informações verdadeiras
                      </span>
                      <span className="text-sm text-text-muted">
                        Mantenha perfil, preços, portfólio e formas de contato
                        corretos e atualizados.
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <span className="font-bold text-text-main block mb-1">
                        Comunicação respeitosa
                      </span>
                      <span className="text-sm text-text-muted">
                        Não use a plataforma para assédio, discriminação, pressão
                        indevida, spam ou linguagem ofensiva.
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <span className="font-bold text-text-main block mb-1">
                        Uso legítimo
                      </span>
                      <span className="text-sm text-text-muted">
                        É proibido anunciar atividades ilícitas, enganosas,
                        fraudulentas ou incompatíveis com a proposta da Skillsy.
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                      <span className="font-bold text-text-main block mb-1">
                        Consequências
                      </span>
                      <span className="text-sm text-text-muted">
                        Perfis, avaliações ou contas podem ser limitados,
                        suspensos ou removidos quando houver abuso, fraude ou
                        descumprimento destes termos.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="privacidade"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main font-heading">
                    Privacidade & Dados
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    O tratamento dos seus dados pessoais segue a nossa Política
                    de Privacidade. Ela explica quais informações podem ser
                    coletadas, como são usadas e quais escolhas você tem dentro
                    da plataforma.
                  </p>
                  <Link
                    href="/privacidade"
                    className="mt-5 inline-flex items-center rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-main transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Ler Política de Privacidade
                  </Link>
                </div>
              </div>
            </section>

            <section
              id="atualizacoes"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-text-main">
                    <RefreshCcw size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-main font-heading">
                      Atualizações dos Termos
                    </h2>
                    <p className="mt-4 text-sm text-text-muted leading-relaxed">
                      Estes termos podem ser atualizados para refletir melhorias,
                      ajustes operacionais ou mudanças legais. O uso continuado da
                      plataforma após a publicação de uma nova versão indica que
                      você tomou conhecimento do texto atualizado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-text-main">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-main font-heading">
                      Dúvidas & Contato
                    </h2>
                    <p className="mt-4 text-sm text-text-muted leading-relaxed">
                      Se você tiver dúvidas sobre estes termos, utilize os canais
                      oficiais divulgados pela Skillsy. Em caso de denúncia,
                      conteúdo impróprio ou suspeita de fraude, entre em contato
                      assim que possível para análise.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 border-t border-border-subtle pt-8 text-center">
            <p className="text-sm text-text-muted">
              Última atualização: 17 de abril de 2026
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
