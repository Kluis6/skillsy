import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Footer } from "@/components/footer";
import Image from "next/image";
import HeaderSection, {
  type HeaderImageItem,
  type HeaderTextSegment,
} from "@/components/headersection";
import { createPublicMetadata } from "@/lib/public-metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "O Que É o Skillsy",
  description:
    "Conheça a proposta do Skillsy, sua missão, valores e a forma como a plataforma busca fortalecer conexões de confiança na comunidade.",
  path: "/weareskillsy",
  imageTitle: "Conheça a proposta do Skillsy",
  imageDescription:
    "Entenda a missão, os valores e a visão da plataforma para fortalecer conexões de confiança.",
  imageLabel: "Sobre o projeto",
});

const principles = [
  {
    title: "Crescimento",
    description:
      "A plataforma existe para abrir espaço para talentos locais, ampliar visibilidade e gerar oportunidades reais.",
    icon: Sparkles,
    tone: "bg-red-500/10 text-red-500 border-red-500/10",
  },
  {
    title: "Serviço",
    description:
      "Acreditamos que trabalho bem-feito, disponibilidade para ajudar e responsabilidade prática fortalecem a vida em comunidade.",
    icon: HeartHandshake,
    tone: "bg-yellow-500/15 text-yellow-500 border-yellow-500/10",
  },
  {
    title: "Confiança",
    description:
      "Queremos facilitar conexões mais seguras, claras e respeitosas entre pessoas que buscam ou oferecem serviços.",
    icon: ShieldCheck,
    tone: "bg-blue-500/15 text-blue-500 border-blue-500/10",
  },
];

const values = [
  {
    title: "Honestidade nas relações",
    description:
      "Perfis, preços, prazos e habilidades devem ser apresentados com clareza e verdade.",
    icon: Compass,
  },
  {
    title: "Respeito entre as pessoas",
    description:
      "Toda conexão deve nascer de comunicação cordial, responsabilidade e consideração pelo outro.",
    icon: Users,
  },
  {
    title: "Iniciativa com propósito",
    description:
      "O Skillsy valoriza o uso dos talentos para gerar apoio prático, renda digna e benefício coletivo.",
    icon: Lightbulb,
  },
];

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: "O Skillsy é uma plataforma criada para transformar " },
  { text: "talentos", className: "text-white" },
  { text: ", " },
  { text: "confiança", className: "text-white" },
  { text: " e " },
  { text: "serviços", className: "text-white" },
  { text: " em conexões reais." },
];

const headerImageItems: HeaderImageItem[] = [
  {
    src: "/Gemini_Generated_Image_m9c1ibm9c1ibm9c1.png",
    alt: "Profissional em destaque",
    wrapperClassName:
      "absolute bottom-0 left-24 sm:left-4 xl:left-[48rem] z-50 h-36 w-48",
    delay: 0.1,
  },
  {
    src: "/Gemini_Generated_Image_1ugrvy1ugrvy1ugr.png",
    alt: "Pessoa atendendo com simpatia",
    wrapperClassName:
      "absolute bottom-0 right-4 sm:right-18 md:right-6 z-20 h-56 w-48",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_2guq8v2guq8v2guq.png",
    alt: "Criadora apresentando seu trabalho",
    wrapperClassName:
      "absolute bottom-0 left-4 sm:left-26 lg:left-28 xl:left-[55rem] z-40 h-74 w-48",
    delay: 0.26,
  },
  {
    src: "/Gemini_Generated_Image_wte2zrwte2zrwte2.png",
    alt: "Prestador de serviço em ambiente profissional",
    wrapperClassName:
      "absolute bottom-0 right-12 sm:right-6 md:right-30 lg:right-32 xl:right-24 z-10 h-92 w-48",
    delay: 0.34,
  },
];

export default function WeAreSkillsyPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_d74ovcd74ovcd74o.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
        imageItems={headerImageItems}
      />

      <div className="mx-auto px-4 container w-full z-[99999] isolate -mt-8 mb-16">
        <div className="w-full xl:p-8 p-4 bg-white z-50 shadow-2xl rounded-lg ">
          <div className="grid grid-cols-12 gap-2 md:gap-4 md:gap-y-8 xl:gap-8 gap-y-8">
            <div className="col-span-12 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Ser Skillsy</h3>
              {/* <div className="w-full p-8 bg-amber-500 sm:bg-blue-500 md:bg-red-500 lg:bg-emerald-500 xl:bg-fuchsia-500 2xl:bg-orange-500"></div> */}
              <p className="text-base font-normal text-gray-800">
                Mais do que um diretório de profissionais, o Skillsy nasce como
                uma iniciativa independente para aproximar pessoas, fortalecer
                relacionamentos de confiança e facilitar o encontro entre quem
                precisa de ajuda e quem pode servir com seu trabalho.
              </p>
            </div>
            {principles.map((principle) => (
              <div
                key={principle.title}
                className={`rounded-md ${principle.tone} col-span-12 md:col-span-4 p-4 border`}
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-white shadow-2xl">
                  <principle.icon size={22} />
                </div>
                <h2 className="mb-3 text-xl font-bold text-text-main">
                  {principle.title}
                </h2>
                <p className="text-sm leading-relaxed text-text-muted">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 container my-24">
        <div className="grid grid-cols-12 gap-4 xl:gap-8 gap-y-8">
          <div className="col-span-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900">
              O que o Skillsy é
            </h3>
          </div>
          <div className="col-span-12 md:col-span-4 h-full w-full">
            <div className="rounded-xl bg-blue-600 p-6 h-full">
              <h3 className="font-bold text-white text-base">
                Uma plataforma de conexões
              </h3>
              <p className="mt-2 text-sm font-normal text-gray-50">
                A Skillsy ajuda pessoas a encontrar e apresentar serviços com
                mais proximidade, contexto e confiança.
              </p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="rounded-xl bg-blue-600 h-full p-6">
              <h3 className="font-bold text-white text-base">
                Um espaço para visibilidade de talentos
              </h3>
              <p className="mt-2 text-sm font-normal text-gray-50">
                Profissionais, empreendedores e pessoas com habilidades úteis
                podem divulgar melhor aquilo que fazem.
              </p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="rounded-xl bg-blue-600 p-6">
              <h3 className="font-bold text-white text-base">
                Uma iniciativa de apoio mútuo
              </h3>
              <p className="mt-2 text-sm font-normal text-gray-50">
                Quando uma contratação acontece com confiança, mais gente é
                beneficiada: quem presta o serviço, quem contrata e a rede ao
                redor.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-surface my-24">
        <div className="mx-auto px-4 container py-18">
          <div className="grid grid-cols-12 gap-4 gap-y-8">
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Nossa missão
                </h3>
                <p className="text-base font-normal text-gray-800">
                  Criar um ambiente onde talentos locais possam ser vistos com
                  mais clareza, onde famílias encontrem ajuda com mais confiança
                  e onde o trabalho bem-feito se torne uma forma concreta de
                  apoiar a comunidade.
                </p>
                <p className="text-base font-normal text-gray-800">
                  Em termos práticos, isso significa aproximar pessoas,
                  incentivar relações mais responsáveis e tornar mais fácil
                  descobrir profissionais, serviços e oportunidades que talvez
                  já estejam perto, mas ainda não estejam conectados.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-700">
                    O que queremos fortalecer
                  </h3>
                  <p className="text-base font-normal text-gray-800">
                    Queremos fortalecer uma cultura de indicação responsável,
                    reputação construída com experiência real, serviço prestado
                    com integridade e oportunidades que circulam dentro da
                    própria comunidade.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="w-full md:h-full h-90 relative overflow-hidden rounded-2xl">
                <Image
                  src={"/Gemini_Generated_Image_mpk4kumpk4kumpk4.png"}
                  alt={""}
                  className="object-top object-cover "
                  fill
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 my-24">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <div className="col-span-12 md:col-span-4">
            <div className=" space-y-4">
              <h2 className="text-xl 2xl:text-2xl font-bold text-gray-900">
                Os valores que guiam a plataforma
              </h2>
              <p className="text-base font-normal text-gray-800">
                O Skillsy cresce melhor quando a tecnologia serve a algo maior:
                relações mais honestas, trabalho mais digno e uma comunidade
                mais disposta a se apoiar.
              </p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-12 gap-4 gap-y-8">
              {values.map((value) => (
                <div key={value.title} className="md:col-span-4 col-span-12">
                  <div className=" border p-4 h-full rounded-md space-y-2 bg-slate-50">
                    <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700  ">
                      <value.icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">
                      {value.title}
                    </h3>
                    <p className="text-sm font-normal text-gray-700">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"></div>
      </section>

      <div className="container mx-auto px-4 my-24">
        <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-slate-50 border  p-8 md:p-10 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">
              O que o Skillsy não pretende ser
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>
                A plataforma não pretende substituir o discernimento pessoal, a
                conversa direta entre as partes ou a responsabilidade de avaliar
                um serviço antes de contratar.
              </p>
              <p>
                Também não pretende funcionar como órgão institucional,
                certificadora oficial de profissionais ou intermediadora
                financeira de negociações.
              </p>
              <p>
                O objetivo do Skillsy é facilitar conexões com mais contexto e
                confiança, não controlar todas as relações que nascem delas.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Como você pode participar
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>
                Você pode participar divulgando seu trabalho, encontrando
                profissionais, compartilhando a plataforma com outras pessoas ou
                contribuindo para o fortalecimento da iniciativa.
              </p>
              <p>
                Cada novo perfil relevante, cada contratação bem-feita e cada
                recomendação responsável ajuda o Skillsy a cumprir melhor sua
                missão.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-3 text-base font-bold text-white transition-colors  w-full"
              >
                Quero Participar
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link
                href="/donation"
                className="inline-flex items-center justify-center rounded-full w-full border border-border-subtle bg-white px-6 py-3 text-base font-bold text-text-main transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Apoiar o Skillsy
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="container mx-auto px-4 mb-24">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <div className="max-w-4xl space-y-3">
            <h2 className="text-lg font-bold text-amber-900">
              Comunicado importante
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/90">
              O Skillsy não possui vínculo institucional, administrativo ou
              oficial com A Igreja de Jesus Cristo dos Santos dos Últimos Dias.
              A plataforma nasceu como uma iniciativa independente de membros
              que desejam incentivar conexões de confiança, apoio prático e
              visibilidade para talentos da comunidade.
            </p>
            <p className="text-sm leading-relaxed text-amber-950/90">
              Isso significa que o uso da plataforma, seus conteúdos e as
              relações estabelecidas por meio dela não representam
              posicionamentos oficiais da Igreja, nem substituem orientações
              pastorais, institucionais ou decisões pessoais de quem participa.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
