import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  FileText,
  Info,
  Mail,
  RefreshCcw,
  Scale,
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
  title: "Termos de Uso",
  description:
    "Entenda como a Skillsy funciona, os limites da plataforma e as responsabilidades de quem usa o serviço.",
  path: "/termos",
  imageTitle: "Termos de Uso do Skillsy",
  imageDescription:
    "Entenda as regras da plataforma, os limites do serviço e as responsabilidades de quem usa o Skillsy.",
  imageLabel: "Página jurídica",
});

const pillars = [
  {
    title: "Conexões",
    description:
      "A Skillsy aproxima quem precisa de um serviço e quem deseja oferecê-lo.",
    icon: Info,
    tone: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  {
    title: "Sem intermediação",
    description:
      "Pagamentos, contratos, valores e combinados são feitos diretamente entre as partes.",
    icon: AlertTriangle,
    tone: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  {
    title: "Responsabilidade",
    description:
      "A plataforma não emprega, certifica, supervisiona nem garante os serviços anunciados.",
    icon: ShieldCheck,
    tone: "bg-red-500/10 text-red-600 border-red-200",
  },
];

const flow = [
  "Você cria um perfil com suas informações, área de atuação e formas de contato.",
  "Outros usuários podem encontrar seu perfil e iniciar uma conversa de forma direta.",
  "Serviço, valores, prazos e demais condições são acertados exclusivamente entre cliente e prestador.",
];

const responsibilities = [
  "A Skillsy não emprega, representa, seleciona, supervisiona ou certifica tecnicamente os profissionais anunciados.",
  "A Skillsy não intermedeia pagamentos, não participa dos contratos privados e não cobra comissão sobre negociações feitas entre usuários.",
  "A decisão de contratar, pagar, aceitar orçamento ou iniciar qualquer prestação de serviço é de inteira responsabilidade das partes envolvidas.",
  "Avaliações, descrições de perfil e informações comerciais são fornecidas pelos próprios usuários e podem ser revistas ou removidas quando violarem estas regras.",
];

const conduct = [
  "Mantenha perfil, preços, portfólio e formas de contato corretos e atualizados.",
  "Use a plataforma com respeito, sem assédio, discriminação, spam ou linguagem ofensiva.",
  "Não anuncie atividades ilícitas, enganosas, fraudulentas ou incompatíveis com a proposta da Skillsy.",
  "Perfis, avaliações ou contas podem ser limitados, suspensos ou removidos em caso de abuso, fraude ou descumprimento destes termos.",
];

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: "Regras para usar o Skillsy com" },
  { text: " respeito", className: "text-white" },
  { text: " e " },
  { text: "responsabilidade", className: "text-white" },
];

const headerImageItems: HeaderImageItem[] = [
  {
    src: "/Gemini_Generated_Image_bgs04bbgs04bbgs0.png",
    alt: "Profissional em atividade",
    wrapperClassName:
      "absolute bottom-0 left-24 sm:left-4 xl:left-[48rem] z-50 h-36 w-48",
    delay: 0.1,
  },
  {
    src: "/Gemini_Generated_Image_ecrgwpecrgwpecrg.png",
    alt: "Pessoa sorrindo durante atendimento",
    wrapperClassName:
      "absolute bottom-0 right-4 sm:right-18 md:right-6 z-20 h-56 w-48",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_74ci7974ci7974ci.png",
    alt: "Criadora mostrando seu trabalho",
    wrapperClassName:
      "absolute bottom-0 left-4 sm:left-26 lg:left-28 xl:left-[55rem] z-40 h-74 w-48",
    delay: 0.26,
  },
  {
    src: "/Gemini_Generated_Image_dzdzcqdzdzcqdzdz.png",
    alt: "Prestador de serviço em ambiente profissional",
    wrapperClassName:
      "absolute bottom-0 right-12 sm:right-6 md:right-30 lg:right-32 xl:right-24 z-10 h-92 w-48",
    delay: 0.34,
  },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_sneeobsneeobsnee.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
        imageItems={headerImageItems}
        overlayClassName="bg-blue-700/70"
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-lg bg-white p-4 shadow-2xl xl:p-8">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Termos de Uso
              </h2>
              <p className="text-base font-normal text-gray-700">
                Estes termos explicam como a Skillsy funciona, o que você pode
                esperar da plataforma e quais responsabilidades continuam sendo
                suas ao contratar ou oferecer serviços.
              </p>
              <p className="text-base font-normal text-gray-700">
                Ao acessar ou usar a Skillsy, você concorda com estas regras. Se
                não concordar, recomendamos não utilizar a plataforma.
              </p>
            </div>

            {pillars.map((item) => (
              <div
                key={item.title}
                className={`col-span-12 rounded-md border p-4 md:col-span-4 space-y-4  `}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-sm ${item.tone} shadow-md`}
                >
                  <item.icon size={22} />
                </div>

                <div className="">
                  <h3 className=" text-lg font-bold text-text-main">
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
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Independência institucional
            </h2>
          </div>

          <div className="col-span-12">
            <div className="rounded-xl border bg-slate-50 p-4 md:p-6 lg:p-8 space-y-4">
              <div className="flex items-start gap-4 ">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700">
                  <Scale size={22} />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-base leading-relaxed text-gray-800">
                  A <strong>Skillsy</strong> é uma iniciativa independente,
                  criada para facilitar conexões profissionais e apoio mútuo
                  entre membros da comunidade.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950/90">
                  <strong className="text-amber-900">Aviso importante:</strong>{" "}
                  a Skillsy não é afiliada, administrada, patrocinada nem
                  endossada oficialmente por{" "}
                  <strong>
                    A Igreja de Jesus Cristo dos Santos dos Últimos Dias
                  </strong>
                  . Também não representa alas, estacas, unidades locais ou
                  departamentos da Igreja.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-24 bg-surface">
        <div className="container mx-auto px-4 py-18">
          <div className="grid grid-cols-12 gap-4 gap-y-8">
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-4">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  Como a Skillsy funciona
                </h2>
                <p className="text-base font-normal text-gray-700">
                  A Skillsy atua como um diretório de conexões. A plataforma
                  ajuda usuários a apresentar seus serviços, encontrar
                  profissionais e iniciar contato com mais facilidade.
                </p>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Fluxo básico de uso
                  </h3>
                  <p className="text-base font-normal text-gray-700">
                    O papel da plataforma é aproximar as partes. As definições
                    comerciais e operacionais continuam sendo feitas diretamente
                    entre usuário contratante e usuário prestador.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-1 gap-4">
                {flow.map((item, index) => (
                  <div key={item} className="rounded-md border bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-blue-700 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">
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
        <div className="grid grid-cols-12 gap-4 lg:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 ">
                Responsabilidades e conduta esperada
              </h2>
              <p className="text-base font-normal text-gray-700">
                O uso saudável da plataforma depende de clareza nas informações,
                respeito nas relações e responsabilidade nas decisões tomadas
                fora dela.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-12 gap-4 gap-y-8">
              <div className="col-span-12 lg:col-span-6">
                <div className="h-full rounded-md border bg-slate-50 p-4 space-y-4">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-amber-100 text-amber-700 shadow-md">
                    <AlertTriangle size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Limites da plataforma
                  </h3>
                  <div className="space-y-3">
                    {responsibilities.map((item) => (
                      <p
                        key={item}
                        className="text-sm leading-relaxed text-gray-700"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6">
                <div className="h-full rounded-md border bg-slate-50 p-4 space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700 shadow-md">
                    <ShieldCheck size={22} />
                  </div>

                  <div className=" space-y-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      Conduta dos usuários
                    </h3>
                    {conduct.map((item) => (
                      <p
                        key={item}
                        className="text-sm leading-relaxed text-gray-700"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-4 md:p- lg:p-10">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                Privacidade e dados
              </h2>
              <div className="flex items-start gap-3">
                <div className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700 shadow-md">
                  <UserCheck size={18} />
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  O tratamento dos seus dados pessoais segue a nossa Política de
                  Privacidade, que explica quais informações podem ser
                  coletadas, como são usadas e quais escolhas você tem dentro da
                  plataforma.
                </p>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">
                Para entender melhor esse tratamento, consulte a{" "}
                <Link
                  href="/privacidade"
                  className="font-semibold text-blue-700 hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="space-y-7 p-4 md:p-6 lg:p-10">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
              Atualizações e contato
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>
                Estes termos podem ser atualizados para refletir melhorias,
                ajustes operacionais ou mudanças legais. O uso continuado da
                plataforma após a publicação de uma nova versão indica que você
                tomou conhecimento do texto atualizado.
              </p>
              <p>
                Se você tiver dúvidas sobre estes termos, utilize os canais
                oficiais divulgados pela Skillsy. Em caso de denúncia, conteúdo
                impróprio ou suspeita de fraude, entre em contato assim que
                possível para análise.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950/90">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className=" flex size-10 shrink-0 items-center justify-center rounded-sm bg-amber-100 text-amber-800">
                    <RefreshCcw size={18} />
                  </div>
                  <div>
                    <strong className="text-amber-900">
                      Última atualização:
                    </strong>{" "}
                    <br />
                    17 de abril de 2026.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-amber-100 text-amber-800">
                    <Mail size={18} />
                  </div>
                  <div>
                    Use os canais oficiais da Skillsy para dúvidas,{" "}
                    <br className="hidden md:flex" /> denúncias e solicitações.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
