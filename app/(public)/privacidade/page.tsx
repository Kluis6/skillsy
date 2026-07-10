import type { Metadata } from "next";
import Link from "next/link";
import {
  Database,
  Eye,
  Lock,
  RefreshCcw,
  Share2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { createPublicMetadata } from "@/lib/public-metadata";
import HeaderSection, {
  HeaderImageItem,
  HeaderTextSegment,
} from "@/components/headersection";

export const metadata: Metadata = createPublicMetadata({
  title: "Política de Privacidade",
  description:
    "Entenda quais dados a Skillsy trata, como eles são usados e quais direitos você pode exercer em relação à sua privacidade.",
  path: "/privacidade",
  imageTitle: "Política de Privacidade",
  imageDescription:
    "Veja como a Skillsy trata dados, protege informações e apresenta os direitos do titular com mais clareza.",
  imageLabel: "Página jurídica",
});

const summaries = [
  {
    title: "Coleta responsável",
    description:
      "Tratamos dados de cadastro, perfil e uso da plataforma na medida necessária para a operação do Skillsy.",
    icon: Database,
    tone: "bg-primary/10 text-primary border-primary/20",
  },
  {
    title: "Uso com finalidade clara",
    description:
      "Os dados ajudam a exibir perfis, facilitar conexões, proteger contas e manter a experiência funcionando.",
    icon: Eye,
    tone: "bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-900/50 dark:text-amber-300",
  },
  {
    title: "Direitos do titular",
    description:
      "Você pode acessar, corrigir e solicitar exclusão de dados, observadas as hipóteses legais aplicáveis.",
    icon: UserCheck,
    tone: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50 dark:text-red-300",
  },
];

const dataTypes = [
  "Dados de cadastro, como nome, e-mail e identificadores necessários para autenticação.",
  "Dados de perfil, como foto, biografia, categoria de serviço, localização, disponibilidade e contatos informados por você.",
  "Dados de uso, como interações dentro da plataforma, avaliações, contatos salvos e preferências, quando aplicável.",
];

const useCases = [
  "Permitir login, autenticação e proteção básica da conta.",
  "Exibir perfis e facilitar a descoberta de serviços por outros usuários.",
  "Permitir contato direto entre pessoas interessadas em contratar ou oferecer serviços.",
  "Melhorar a operação da plataforma e prevenir fraudes, spam e usos indevidos.",
];

const rights = [
  "Confirmação da existência de tratamento e acesso aos seus dados.",
  "Correção de dados incompletos, inexatos ou desatualizados.",
  "Solicitação de exclusão, anonimização ou bloqueio, quando cabível.",
  "Informações sobre compartilhamento, consentimento e outras medidas previstas em lei.",
];

const cookieCategories = [
  "Essenciais: necessarios para seguranca, autenticacao e funcionamento basico da plataforma.",
  "Preferencias: usados para lembrar escolhas de experiencia, como estados visuais e conveniencias de navegacao.",
  "A Skillsy deve evitar ativar analytics, publicidade comportamental ou rastreadores de terceiros sem consentimento especifico e destacado.",
];

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: " Privacidade com" },
  { text: " clareza", className: "text-white" },
  { text: ", cuidado" },
  { text: " e " },
  { text: "responsabilidade", className: "text-white" },
];

const headerImageItems: HeaderImageItem[] = [
  {
    src: "/Gemini_Generated_Image_2qahju2qahju2qah copy.png",
    alt: "Profissional em atividade",
    wrapperClassName:
      "absolute bottom-0 left-24 sm:left-4 xl:left-[48rem] z-50 h-36 w-48",
    delay: 0.1,
  },
  {
    src: "/Gemini_Generated_Image_6gqiiy6gqiiy6gqi.png",
    alt: "Pessoa sorrindo durante atendimento",
    wrapperClassName:
      "absolute bottom-0 right-4 sm:right-18 md:right-6 z-20 h-56 w-48",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_m9c1ibm9c1ibm9c1.png",
    alt: "Criadora mostrando seu trabalho",
    wrapperClassName:
      "absolute bottom-0 left-4 sm:left-26 lg:left-28 xl:left-[55rem] z-40 h-74 w-48",
    delay: 0.26,
  },
  {
    src: "/Gemini_Generated_Image_ndy0l8ndy0l8ndy0.png",
    alt: "Prestador de serviço em ambiente profissional",
    wrapperClassName:
      "absolute bottom-0 right-12 sm:right-6 md:right-30 lg:right-32 xl:right-24 z-10 h-92 w-48",
    delay: 0.34,
  },
];

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_8gh7rv8gh7rv8gh7.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
        imageItems={headerImageItems}
        overlayClassName="bg-blue-700/70"
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-xl bg-card p-4 shadow-sm xl:p-8 border border-border-subtle">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-text-main">
                Política de Privacidade
              </h2>
              <div className="space-y-2">
                <p className="text-base font-normal text-text-muted">
                  Esta política explica quais dados a Skillsy pode tratar, por
                  que eles são usados, com quem podem ser compartilhados e como
                  você pode exercer seus direitos.
                </p>
                <p className="text-base font-normal text-text-muted">
                  Nosso objetivo é tratar suas informações com clareza, cuidado
                  e apenas na medida necessária para o funcionamento da
                  plataforma.
                </p>
              </div>
            </div>

            {summaries.map((item) => (
              <div
                key={item.title}
                className={`col-span-12 rounded-md border p-4 lg:col-span-4 space-y-4 `}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-sm ${item.tone}`}
                >
                  <item.icon size={22} />
                </div>
                <div className="">
                  <h3 className="text-lg lg:text-xl font-bold text-text-main">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
          <div className="col-span-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">
              Quais dados podemos coletar
            </h2>
          </div>

          {dataTypes.map((item, index) => (
            <div key={item} className="col-span-12 md:col-span-4">
              <div className="h-full rounded-xl bg-primary p-6 text-white">
                <span className="text-sm font-bold text-white/80">
                  Grupo {index + 1}
                </span>
                <p className="mt-3 text-sm font-normal text-white/85">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="my-24 bg-surface">
        <div className="container mx-auto px-4 py-18">
          <div className="grid grid-cols-12 gap-4 gap-y-8">
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-text-main">
                  Como usamos esses dados
                </h2>
                <p className="text-base font-normal text-text-muted">
                  O tratamento pode se apoiar em bases legais previstas na LGPD,
                  como execução dos serviços da plataforma, legítimo interesse
                  compatível com a operação e, quando aplicável, consentimento
                  do titular.
                </p>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-main">
                    Na prática, isso inclui
                  </h3>
                  <p className="text-base font-normal text-text-muted">
                    Viabilizar login, exibir perfis, facilitar conexões,
                    permitir contato entre usuários e proteger a plataforma
                    contra fraude, abuso e uso indevido.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-1 gap-4">
                {useCases.map((item) => (
                  <div key={item} className="rounded-md border border-border-subtle bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                        <Eye size={18} />
                      </div>
                      <p className="text-sm leading-relaxed text-text-muted">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Compartilhamento, retenção e segurança
              </h2>
              <p className="text-base font-normal text-text-muted">
                A Skillsy não comercializa dados pessoais para publicidade de
                terceiros e busca limitar o tratamento ao necessário para a
                operação da plataforma.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-12 gap-4 gap-y-8">
              <div className="col-span-12 md:col-span-4">
                <div className="h-full space-y-2 rounded-md border border-border-subtle bg-surface p-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <Share2 size={22} />
                  </div>
                  <h3 className="text-base font-bold text-text-main">
                    Compartilhamento
                  </h3>
                  <p className="text-sm font-normal text-text-muted">
                    Dados públicos do perfil podem ser exibidos a outros
                    usuários e dados operacionais podem ser tratados por
                    fornecedores essenciais da plataforma.
                  </p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="h-full space-y-2 rounded-md border border-border-subtle bg-surface p-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <Lock size={22} />
                  </div>
                  <h3 className="text-base font-bold text-text-main">
                    Retenção
                  </h3>
                  <p className="text-sm font-normal text-text-muted">
                    Os dados são mantidos pelo tempo necessário para cumprir as
                    finalidades desta política e atender exigências legais,
                    regulatórias ou de defesa de direitos.
                  </p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="h-full space-y-2 rounded-md border border-border-subtle bg-surface p-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="text-base font-bold text-text-main">
                    Segurança
                  </h3>
                  <p className="text-sm font-normal text-text-muted">
                    Adotamos medidas razoáveis para reduzir riscos de acesso
                    indevido, uso inadequado e perda de dados, considerando o
                    porte e a natureza do produto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="mt-12 grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-surface p-4 md:p-6 lg:p-10">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Seus direitos e escolhas
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                Nos termos da LGPD, você pode solicitar, conforme o caso:
              </p>
              <div className="space-y-3">
                {rights.map((item) => (
                  <div
                    key={item}
                    className="rounded-md border border-border-subtle bg-card p-4 text-sm text-text-muted"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl lg:text-2xl font-bold text-text-main">
              Atualizações e contato
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-text-muted">
              <p>
                Esta política pode ser revisada para refletir melhorias do
                produto, ajustes operacionais ou mudanças legais. A versão mais
                recente estará sempre disponível nesta página.
              </p>
              <p>
                Se você tiver dúvidas sobre esta política ou quiser exercer
                direitos relacionados aos seus dados, utilize os canais oficiais
                divulgados pela Skillsy dentro da própria plataforma.
              </p>
              <p>
                Para contexto complementar sobre funcionamento,
                responsabilidades e limites da plataforma, consulte também os{" "}
                <Link href="/termos" className="font-semibold text-primary hover:underline">
                  Termos de Uso
                </Link>
                .
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950/90 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100/85">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
                  <RefreshCcw size={18} />
                </div>
                <div>
                  <strong className="text-amber-900 dark:text-amber-100">
                    Última atualização:
                  </strong>
                  <br />
                  17 de abril de 2026.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="container mx-auto mb-24 px-4">
        <div className="rounded-2xl border border-border-subtle bg-surface p-4 md:p-6 lg::p-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Cookies e tecnologias similares
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                A Skillsy usa um aviso de cookies para diferenciar recursos
                essenciais de preferencias opcionais. Cookies de conveniencia
                nao devem ser gravados antes da escolha do titular, e a recusa
                nao pode bloquear o acesso ao conteudo principal da plataforma.
              </p>
              <p className="text-sm leading-relaxed text-text-muted">
                Caso novos rastreadores, analytics ou ferramentas de marketing
                sejam adotados, a politica e o mecanismo de consentimento devem
                ser atualizados antes da ativacao em producao.
              </p>
            </div>

            <div className="space-y-3">
              {cookieCategories.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border-subtle bg-card p-4 text-sm text-text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
