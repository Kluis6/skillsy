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
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Visibilidade na sua região",
    description:
      "Mostre seu trabalho para pessoas da sua cidade e arredores que buscam indicações mais confiáveis.",
    icon: Zap,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    title: "Reputação com experiência real",
    description:
      "Receba avaliações de quem contratou você e ajude outros usuários a decidir com mais segurança.",
    icon: Star,
    tone: "bg-red-500/10 text-red-600 dark:text-red-300",
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

export default function JoinPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
        overlayClassName="bg-blue-700/70"
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-xl bg-card p-4 shadow-sm xl:p-8 border border-border-subtle">
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
                  className={`flex size-12 items-center justify-center rounded-sm ${benefit.tone}`}
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
                <Button className="h-12 w-full rounded-full bg-primary px-6 text-base font-bold text-white hover:bg-primary/90 sm:w-auto">
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
                    <div className="flex size-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
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
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-100">
              Comunicado importante
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/90 dark:text-amber-100/85">
              O Skillsy não intermedeia pagamentos, não certifica tecnicamente
              os profissionais cadastrados e não substitui a responsabilidade
              pessoal de avaliar um serviço antes de contratar.
            </p>
            <p className="text-sm leading-relaxed text-amber-950/90 dark:text-amber-100/85">
              A plataforma existe para facilitar conexões com mais contexto e
              confiança, mas acordos, valores, prazos e decisões finais
              continuam sendo definidos diretamente entre as partes.
            </p>
          </div>
        </section>
      </div>

      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold md:text-4xl">
            Trabalho, confiança e serviço também fortalecem a comunidade.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85">
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
