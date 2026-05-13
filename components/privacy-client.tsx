import Link from 'next/link';
import {
  Database,
  Eye,
  FileText,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Share2,
  UserCheck,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const summaryCards = [
  {
    eyebrow: 'Coleta',
    text: 'Tratamos dados de cadastro, perfil e uso da plataforma na medida necessária para a operação do Skillsy.',
    tone: 'bg-primary/5 border-primary/10 text-primary',
  },
  {
    eyebrow: 'Uso',
    text: 'Os dados ajudam a exibir perfis, facilitar conexões, proteger contas e manter a experiência funcionando.',
    tone: 'bg-highlight/5 border-highlight/10 text-highlight',
  },
  {
    eyebrow: 'Direitos',
    text: 'Você pode acessar, corrigir e solicitar exclusão de dados, observadas as hipóteses legais aplicáveis.',
    tone: 'bg-surface border-border-subtle text-text-main',
  },
];

const sectionLinks = [
  { href: '#coleta', label: 'Dados Coletados' },
  { href: '#uso', label: 'Como Usamos' },
  { href: '#compartilhamento', label: 'Compartilhamento' },
  { href: '#seguranca', label: 'Segurança' },
  { href: '#retencao', label: 'Retenção' },
  { href: '#direitos', label: 'Seus Direitos' },
];

export function PrivacyClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-12 shadow-sm">
            <div className="absolute top-0 right-0 h-52 w-52 rounded-full bg-primary/8 blur-3xl" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
                <FileText size={14} />
                Privacidade da Plataforma
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-text-main mb-6 font-heading tracking-tight">
                Política de <span className="text-primary">Privacidade</span>
              </h1>
              <p className="text-lg md:text-xl text-text-muted leading-relaxed">
                Esta política explica quais dados a Skillsy pode tratar, por
                que eles são usados, com quem podem ser compartilhados e como
                você pode exercer seus direitos.
              </p>
              <p className="text-sm md:text-base text-text-muted leading-relaxed mt-5 max-w-2xl">
                Nosso objetivo é tratar suas informações com clareza, cuidado e
                somente na medida necessária para o funcionamento da plataforma.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {summaryCards.map((card) => (
              <div
                key={card.eyebrow}
                className={`rounded-[2rem] border p-6 ${card.tone}`}
              >
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
                  {card.eyebrow}
                </span>
                <p className="text-sm leading-relaxed text-text-muted">
                  {card.text}
                </p>
              </div>
            ))}
          </section>

          <nav
            aria-label="Seções da política de privacidade"
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
              id="coleta"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Database size={24} />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-bold font-heading text-text-main">
                    Quais Dados Podemos Coletar
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    A Skillsy procura tratar apenas os dados necessários para
                    autenticação, criação de perfil, conexão entre usuários e
                    funcionamento da plataforma.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-relaxed text-text-muted">
                    <li>
                      <strong className="text-text-main">Dados de cadastro:</strong>{' '}
                      nome, e-mail e identificadores necessários para login.
                    </li>
                    <li>
                      <strong className="text-text-main">Dados de perfil:</strong>{' '}
                      foto, biografia, categoria de serviço, localização,
                      disponibilidade e formas de contato informadas por você.
                    </li>
                    <li>
                      <strong className="text-text-main">Dados de uso:</strong>{' '}
                      informações relacionadas a interações dentro da plataforma,
                      como contatos salvos, avaliações e preferências de uso,
                      quando aplicável.
                    </li>
                    <li>
                      <strong className="text-text-main">Dados técnicos:</strong>{' '}
                      registros básicos necessários para segurança, autenticação
                      e operação do serviço, conforme gerados pelos sistemas e
                      fornecedores essenciais da plataforma.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="uso"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-highlight/10 text-highlight">
                  <Eye size={24} />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-bold font-heading text-text-main">
                    Como Usamos Esses Dados
                  </h2>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted leading-relaxed">
                      Permitir login, autenticação e proteção básica da conta.
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted leading-relaxed">
                      Exibir seu perfil e facilitar a descoberta de serviços por
                      outros usuários.
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted leading-relaxed">
                      Permitir contato direto entre pessoas interessadas em
                      contratar ou oferecer serviços.
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted leading-relaxed">
                      Melhorar a operação da plataforma, prevenir fraudes, spam
                      e usos indevidos.
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-text-muted leading-relaxed">
                    O tratamento pode se apoiar em bases legais previstas na
                    LGPD, como execução de serviços da plataforma, legítimo
                    interesse compatível com a operação e, quando aplicável,
                    consentimento do titular.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="compartilhamento"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Share2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-text-main">
                    Compartilhamento de Dados
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    A Skillsy não comercializa dados pessoais para publicidade
                    de terceiros. Ainda assim, alguns dados podem ser tratados
                    por fornecedores essenciais à operação da plataforma.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-relaxed text-text-muted">
                    <li>
                      Dados públicos do perfil podem ser exibidos a outros
                      usuários conforme as configurações e a finalidade da
                      plataforma.
                    </li>
                    <li>
                      Dados podem ser processados por serviços de autenticação,
                      hospedagem, banco de dados e infraestrutura utilizados pela
                      Skillsy para manter o produto funcionando.
                    </li>
                    <li>
                      Também pode haver compartilhamento quando necessário para
                      cumprir obrigação legal, atender autoridade competente ou
                      proteger direitos da própria plataforma e de terceiros.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="seguranca"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-text-main">
                    Segurança das Informações
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    A Skillsy adota medidas razoáveis para reduzir riscos de
                    acesso indevido, uso inadequado e perda de dados,
                    considerando o porte e a natureza da plataforma.
                  </p>
                  <p className="mt-4 text-sm text-text-muted leading-relaxed">
                    Nenhum sistema é totalmente imune a falhas, mas buscamos
                    manter controles técnicos e operacionais compatíveis com a
                    experiência oferecida ao usuário.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="retencao"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-text-main">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-text-main">
                    Retenção & Eliminação
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    Os dados pessoais são mantidos pelo tempo necessário para
                    cumprir as finalidades desta política, operar a conta do
                    usuário e atender exigências legais, regulatórias ou de
                    defesa de direitos, quando aplicáveis.
                  </p>
                  <p className="mt-4 text-sm text-text-muted leading-relaxed">
                    Quando houver pedido de exclusão ou encerramento de conta, a
                    Skillsy buscará eliminar ou anonimizar os dados pertinentes,
                    observadas as hipóteses legais de conservação previstas na
                    LGPD.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="direitos"
              className="scroll-mt-28 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserCheck size={24} />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl font-bold font-heading text-text-main">
                    Seus Direitos & Escolhas
                  </h2>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    Nos termos da LGPD, você pode solicitar, conforme o caso:
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted">
                      Confirmação da existência de tratamento e acesso aos seus
                      dados.
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted">
                      Correção de dados incompletos, inexatos ou desatualizados.
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted">
                      Exclusão, anonimização ou bloqueio, quando cabível.
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm text-text-muted">
                      Informações sobre compartilhamento, consentimento e outras
                      medidas previstas em lei.
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-text-muted leading-relaxed">
                    Parte dessas ações também pode ser feita diretamente nas
                    configurações do seu perfil. Para contexto de uso da
                    plataforma, consulte também os{' '}
                    <Link
                      href="/termos"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Termos de Uso
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-text-main">
                    <RefreshCcw size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-text-main">
                      Atualizações Desta Política
                    </h2>
                    <p className="mt-4 text-sm text-text-muted leading-relaxed">
                      Esta política pode ser revisada para refletir melhorias do
                      produto, ajustes operacionais ou mudanças legais. A versão
                      mais recente estará sempre disponível nesta página.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-text-main">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-text-main">
                      Dúvidas & Solicitações
                    </h2>
                    <p className="mt-4 text-sm text-text-muted leading-relaxed">
                      Se você tiver dúvidas sobre esta política ou quiser exercer
                      direitos relacionados aos seus dados, utilize os canais
                      oficiais divulgados pela Skillsy dentro da própria
                      plataforma.
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
