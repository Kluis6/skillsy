import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import HeaderSection, {
  type HeaderImageItem,
  type HeaderTextSegment,
} from "@/components/headersection";
import { Button } from "@/components/ui/button";
import { createPublicMetadata } from "@/lib/public-metadata";
import Sectionstart from "@/components/sectionstart";

export const metadata: Metadata = createPublicMetadata({
  title: "Participe do Skillsy",
  description:
    "Cadastre-se no Skillsy para divulgar seu trabalho, encontrar oportunidades e fortalecer conexões de confiança na comunidade.",
  path: "/join",
  imageTitle: "Participe do Skillsy",
  imageDescription:
    "Divulgue seu trabalho, fortaleça sua reputação e gere novas conexões dentro da comunidade.",
  imageLabel: "Cadastro público",
  socialImagePath: "/join/opengraph-image",
});

const benefits = [
  {
    title: "Confiança que aproxima",
    description:
      "Conecte-se com pessoas que valorizam honestidade, respeito e bom atendimento em cada contato.",
    icon: ShieldCheck,
    tone: "bg-blue-500/10 text-blue-700",
  },
  {
    title: "Visibilidade na sua região",
    description:
      "Mostre seu trabalho para pessoas da sua cidade e arredores que buscam indicações mais confiáveis.",
    icon: Zap,
    tone: "bg-amber-500/10 text-amber-700",
  },
  {
    title: "Reputação com experiência real",
    description:
      "Receba avaliações de quem contratou você e ajude outros usuários a decidir com mais segurança.",
    icon: Star,
    tone: "bg-red-500/10 text-red-600",
  },
];

const highlights = [
  {
    title: "Conexões que continuam",
    description:
      "Mais do que fechar um serviço, você constrói relacionamentos que podem gerar novas oportunidades.",
    icon: Users,
  },
  {
    title: "Espaço para crescer",
    description:
      "Quem presta um bom serviço encontra mais visibilidade. Quem contrata encontra ajuda com mais proximidade.",
    icon: Trophy,
  },
  {
    title: "Comunidade mais forte",
    description:
      "Quando talentos locais se apoiam, todos ganham: profissionais, famílias e a rede ao redor.",
    icon: Heart,
  },
];

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: "Seu trabalho pode gerar " },
  {
    text: "oportunidades",
    className: "text-white drop-shadow-sm drop-shadow-black/50",
  },
  { text: ", conexões de " },
  {
    text: "confiança",
    className: "text-white drop-shadow-sm drop-shadow-black/50",
  },
  { text: " e " },
  {
    text: "apoio real",
    className: "text-white drop-shadow-sm drop-shadow-black/50",
  },
  { text: " dentro da comunidade." },
];

const headerImageItems: HeaderImageItem[] = [
  {
    src: "/Gemini_Generated_Image_xfqkexfqkexfqkex.png",
    alt: "Profissional em atividade",
    wrapperClassName:
      "absolute bottom-0 left-24 sm:left-4 xl:left-[48rem] z-50 h-36 w-48",
    delay: 0.1,
  },
  {
    src: "/Gemini_Generated_Image_sh3dqosh3dqosh3d.png",
    alt: "Pessoa sorrindo durante atendimento",
    wrapperClassName:
      "absolute bottom-0 right-4 sm:right-18 md:right-6 z-20 h-56 w-48",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_oc5c5poc5c5poc5c.png",
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

export default function JoinPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
        imageItems={headerImageItems}
        overlayClassName="bg-blue-700/70"
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-lg bg-card p-4 shadow-2xl xl:p-8 border border-border-subtle">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-text-main">
                Participe do Skillsy
              </h2>
              <p className="text-base font-normal text-text-muted">
                O Skillsy foi criado para ajudar pessoas a divulgar seus
                talentos, encontrar profissionais com mais contexto e fortalecer
                uma rede de apoio baseada em confiança, serviço e
                responsabilidade.
              </p>
            </div>

            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`col-span-12 rounded-md border p-4 lg:col-span-4 space-y-4 `}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-sm shadow-md ${benefit.tone}`}
                >
                  <benefit.icon size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-text-main">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="col-span-12 flex flex-col gap-4 sm:flex-row">
              <AuthModal>
                <Button className="h-12 w-full rounded-full bg-blue-700 px-6 text-base font-bold text-white hover:bg-blue-700/90 sm:w-auto">
                  Criar Minha Conta
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </AuthModal>
            </div>
          </div>
        </div>
      </div>

      <Sectionstart />

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-text-main 2xl:text-2xl">
                O que essa participação pode fortalecer
              </h2>
              <p className="text-base font-normal text-text-muted">
                Cada perfil relevante, cada contratação bem-feita e cada
                recomendação responsável ajudam a tornar o Skillsy mais útil
                para todos.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-12 gap-2 md:gap-4 gap-y-8">
              {highlights.map((item) => (
                <div key={item.title} className="col-span-12 md:col-span-4">
                  <div className="h-full space-y-2 rounded-md border border-border-subtle bg-surface p-4">
                    <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700 shadow-md">
                      <item.icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-text-main">
                      {item.title}
                    </h3>
                    <p className="text-sm font-normal text-text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="my-24 bg-surface">
        <div className="container mx-auto px-4 py-18">
          <div className="grid grid-cols-12 gap-4 gap-y-8">
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-text-main">
                  Por que vale a pena participar
                </h2>
                <p className="text-base font-normal text-text-muted">
                  Participar do Skillsy não é apenas criar um perfil. É abrir
                  espaço para que seu trabalho seja visto, lembrado e
                  recomendado com mais segurança.
                </p>
                <p className="text-base font-normal text-text-muted">
                  A plataforma foi pensada para facilitar encontros entre
                  pessoas que precisam de ajuda prática e pessoas dispostas a
                  servir com qualidade, honestidade e cuidado.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-main">
                    O que você encontra aqui
                  </h3>
                  <p className="text-base font-normal text-text-muted">
                    Mais visibilidade para talentos locais, mais confiança na
                    hora de contratar e uma rede que pode gerar novas conexões,
                    indicações e oportunidades reais.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="relative h-90 w-full overflow-hidden rounded-2xl md:h-full">
                <Image
                  src="/Gemini_Generated_Image_lb1x7blb1x7blb1x copy.png"
                  alt="Pessoas em colaboração e atendimento"
                  className="object-cover object-top"
                  fill
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-amber-900">
              Comunicado importante
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/90">
              O Skillsy não intermedeia pagamentos, não certifica tecnicamente
              os profissionais cadastrados e não substitui a responsabilidade
              pessoal de avaliar um serviço antes de contratar.
            </p>
            <p className="text-sm leading-relaxed text-amber-950/90">
              A plataforma existe para facilitar conexões com mais contexto e
              confiança, mas acordos, valores, prazos e decisões finais
              continuam sendo definidos diretamente entre as partes.
            </p>
          </div>
        </section>
      </div>

      <section className="bg-blue-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold md:text-4xl">
            Trabalho, confiança e serviço também fortalecem a comunidade.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-50">
            Ao entrar no Skillsy, você ajuda a transformar habilidades em apoio
            real e abre espaço para que oportunidades circulem com mais clareza
            entre pessoas da mesma rede.
          </p>
          <div className="mt-8 flex justify-center">
            <AuthModal>
              <Button className="h-12 rounded-full bg-card px-8 text-base font-bold text-primary hover:bg-surface">
                Fazer Parte do Skillsy
              </Button>
            </AuthModal>
          </div>
        </div>
      </section>
    </main>
  );
}
