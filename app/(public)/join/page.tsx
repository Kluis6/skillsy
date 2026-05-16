import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Heart, ShieldCheck, Star, Trophy, Users, Zap } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import HeaderSection, {
  type HeaderImageItem,
  type HeaderTextSegment,
} from "@/components/headersection";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Participe do Skillsy",
  description:
    "Cadastre-se no Skillsy para divulgar seu trabalho, encontrar oportunidades e fortalecer conexões de confiança na comunidade.",
};

const benefits = [
  {
    title: "Confiança que aproxima",
    description:
      "Conecte-se com pessoas que valorizam honestidade, respeito e bom atendimento em cada contato.",
    icon: ShieldCheck,
    tone: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  {
    title: "Visibilidade na sua região",
    description:
      "Mostre seu trabalho para pessoas da sua cidade e arredores que buscam indicações mais confiáveis.",
    icon: Zap,
    tone: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  {
    title: "Reputação com experiência real",
    description:
      "Receba avaliações de quem contratou você e ajude outros usuários a decidir com mais segurança.",
    icon: Star,
    tone: "bg-red-500/10 text-red-600 border-red-200",
  },
];

const steps = [
  {
    title: "Crie seu perfil",
    description:
      "Apresente quem você é, o que você faz, onde atende e como pode ajudar.",
  },
  {
    title: "Conecte-se com a comunidade",
    description:
      "Encontre profissionais, receba contatos e comece conversas com mais contexto.",
  },
  {
    title: "Construa sua reputação",
    description:
      "Entregue um bom serviço, receba avaliações e fortaleça sua presença na plataforma.",
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
  { text: "oportunidades", className: "text-red-500" },
  { text: ", " },
  { text: "confiança", className: "text-amber-400" },
  { text: " e " },
  { text: "apoio real", className: "text-blue-300" },
  { text: " dentro da comunidade." },
];

const headerImageItems: HeaderImageItem[] = [
  {
    src: "/Gemini_Generated_Image_m9c1ibm9c1ibm9c1.png",
    alt: "Profissional em atividade",
    wrapperClassName:
      "absolute bottom-0 left-24 sm:left-4 xl:left-[48rem] z-50 h-36 w-48",
    delay: 0.1,
  },
  {
    src: "/Gemini_Generated_Image_1ugrvy1ugrvy1ugr.png",
    alt: "Pessoa sorrindo durante atendimento",
    wrapperClassName:
      "absolute bottom-0 right-4 sm:right-18 md:right-6 z-20 h-56 w-48",
    delay: 0.18,
  },
  {
    src: "/Gemini_Generated_Image_2qahju2qahju2qah.png",
    alt: "Criadora mostrando seu trabalho",
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

export default function JoinPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_d74ovcd74ovcd74o.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
        imageItems={headerImageItems}
        overlayClassName="bg-blue-700/70"
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-lg bg-white p-4 shadow-2xl xl:p-8">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                <CheckCircle2 size={14} />
                Cadastro gratuito
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Participe do Skillsy</h2>
              <p className="text-base font-normal text-gray-800">
                O Skillsy foi criado para ajudar pessoas a divulgar seus talentos, encontrar
                profissionais com mais contexto e fortalecer uma rede de apoio baseada em
                confiança, serviço e responsabilidade.
              </p>
              <p className="max-w-3xl text-sm leading-relaxed text-gray-700">
                Iniciativa independente criada por membros da comunidade. O Skillsy não é
                afiliado nem representa oficialmente A Igreja de Jesus Cristo dos Santos dos
                Últimos Dias.
              </p>
            </div>

            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`col-span-12 rounded-md border p-4 md:col-span-4 ${benefit.tone}`}
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-white shadow-2xl">
                  <benefit.icon size={22} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{benefit.description}</p>
              </div>
            ))}

            <div className="col-span-12 flex flex-col gap-4 sm:flex-row">
              <AuthModal>
                <Button className="h-12 w-full rounded-full bg-blue-700 px-6 text-base font-bold text-white hover:bg-blue-700/90 sm:w-auto">
                  Criar Minha Conta
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </AuthModal>
              <a
                href="#como-funciona"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border-subtle bg-white px-6 text-base font-bold text-text-main transition-colors hover:bg-surface sm:w-auto"
              >
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </div>

      <section id="como-funciona" className="container mx-auto my-24 px-4 scroll-mt-24">
        <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
          <div className="col-span-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Como entrar e começar</h2>
          </div>

          {steps.map((step, index) => (
            <div key={step.title} className="col-span-12 md:col-span-4">
              <div className="h-full rounded-xl bg-blue-600 p-6 text-white">
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
                  Etapa {index + 1}
                </span>
                <h3 className="mt-3 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm font-normal text-blue-50">{step.description}</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Por que vale a pena participar</h2>
                <p className="text-base font-normal text-gray-800">
                  Participar do Skillsy não é apenas criar um perfil. É abrir espaço para que
                  seu trabalho seja visto, lembrado e recomendado com mais segurança.
                </p>
                <p className="text-base font-normal text-gray-800">
                  A plataforma foi pensada para facilitar encontros entre pessoas que precisam
                  de ajuda prática e pessoas dispostas a servir com qualidade, honestidade e
                  cuidado.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-700">O que você encontra aqui</h3>
                  <p className="text-base font-normal text-gray-800">
                    Mais visibilidade para talentos locais, mais confiança na hora de contratar
                    e uma rede que pode gerar novas conexões, indicações e oportunidades reais.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="relative h-90 w-full overflow-hidden rounded-2xl md:h-full">
                <Image
                  src="/Gemini_Generated_Image_mpk4kumpk4kumpk4.png"
                  alt="Pessoas em colaboração e atendimento"
                  className="object-cover object-top"
                  fill
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 2xl:text-2xl">
                O que essa participação pode fortalecer
              </h2>
              <p className="text-base font-normal text-gray-800">
                Cada perfil relevante, cada contratação bem-feita e cada recomendação
                responsável ajudam a tornar o Skillsy mais útil para todos.
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-12 gap-4 gap-y-8">
              {highlights.map((item) => (
                <div key={item.title} className="col-span-12 md:col-span-4">
                  <div className="h-full space-y-2 rounded-md border bg-slate-50 p-4">
                    <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700">
                      <item.icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">{item.title}</h3>
                    <p className="text-sm font-normal text-gray-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <div className="max-w-4xl space-y-3">
            <h2 className="text-lg font-bold text-amber-900">Comunicado importante</h2>
            <p className="text-sm leading-relaxed text-amber-950/90">
              O Skillsy não intermedeia pagamentos, não certifica tecnicamente os profissionais
              cadastrados e não substitui a responsabilidade pessoal de avaliar um serviço antes
              de contratar.
            </p>
            <p className="text-sm leading-relaxed text-amber-950/90">
              A plataforma existe para facilitar conexões com mais contexto e confiança, mas
              acordos, valores, prazos e decisões finais continuam sendo definidos diretamente
              entre as partes.
            </p>
          </div>
        </section>
      </div>

      <section className="bg-blue-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold md:text-4xl">
            Trabalho, confiança e serviço também fortalecem a comunidade.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-50">
            Ao entrar no Skillsy, você ajuda a transformar habilidades em apoio real e abre
            espaço para que oportunidades circulem com mais clareza entre pessoas da mesma rede.
          </p>
          <div className="mt-8 flex justify-center">
            <AuthModal>
              <Button className="h-12 rounded-full bg-white px-8 text-base font-bold text-blue-700 hover:bg-white/90">
                Fazer Parte do Skillsy
              </Button>
            </AuthModal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
