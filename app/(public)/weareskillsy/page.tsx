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
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Image from "next/image";

export const metadata: Metadata = {
  title: "O Que É o Skillsy",
  description:
    "Conheça a proposta do Skillsy, sua missão, valores e a forma como a plataforma busca fortalecer conexões de confiança na comunidade.",
};

const principles = [
  {
    title: "Confiança",
    description:
      "Queremos facilitar conexões mais seguras, claras e respeitosas entre pessoas que buscam ou oferecem serviços.",
    icon: ShieldCheck,
    tone: "bg-primary/5 text-primary border-primary/10",
  },
  {
    title: "Serviço",
    description:
      "Acreditamos que trabalho bem-feito, disponibilidade para ajudar e responsabilidade prática fortalecem a vida em comunidade.",
    icon: HeartHandshake,
    tone: "bg-highlight/5 text-highlight border-highlight/10",
  },
  {
    title: "Crescimento",
    description:
      "A plataforma existe para abrir espaço para talentos locais, ampliar visibilidade e gerar oportunidades reais.",
    icon: Sparkles,
    tone: "bg-surface text-text-main border-border-subtle",
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

export default function WeAreSkillsyPage() {
  return (
    <main className="min-h-screen w-full">
      <div className="md:h-[82vh] h-[78vh] relative w-full object-fill bg-cover bg-blend-multiply  bg-blue-600/70 bg-[url(public/Gemini_Generated_Image_d74ovcd74ovcd74o.png)]">
        <div className="md:left-6 left-4 top-1/3 absolute -translate-y-1/2 w-xs md:w-2xl z-40">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white md:text-5xl drop-shadow-xl shadow-black">
            O Skillsy é uma plataforma criada para transformar{" "}
            <span className="text-red-500">talentos</span>,{" "}
            <span className="text-amber-500">confiança</span> e{" "}
            <span className="text-blue-500">serviços</span> em conexões reais.
          </h1>
        </div>
        <div className="absolute bottom-0 right-0 md:right-6 w-full flex items-end justify-end">
          <div className="w-48 z-30 h-36 relative rounded-t-full mr-12 overflow-hidden shadow-sm">
            <Image
              src={"/Gemini_Generated_Image_m9c1ibm9c1ibm9c1.png"}
              alt={""}
              className="object-cover"
              fill
            />
          </div>
          <div className="w-48 z-20 h-56 relative rounded-t-full -mr-84 overflow-hidden shadow">
            <Image
              src={"/Gemini_Generated_Image_1ugrvy1ugrvy1ugr.png"}
              alt={""}
              className="object-cover"
              fill
            />
          </div>
          <div className="w-48 z-40 h-74 relative rounded-t-full -mr-24 overflow-hidden shadow-2xl">
            <Image
              src={"/Gemini_Generated_Image_2qahju2qahju2qah.png"}
              alt={""}
              className="object-cover"
              fill
            />
          </div>
          <div className="w-48 z-10 h-92 relative rounded-t-full mr-12 overflow-hidden shadow-2xs">
            <Image
              src={"/Gemini_Generated_Image_wte2zrwte2zrwte2.png"}
              alt={""}
              className="object-cover"
              fill
            />
          </div>
        </div>
      </div>

      <main className="">
        <div className="">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-12 shadow-sm">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
            <div className="relative z-10 max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <Users size={14} />
                Quem Somos
              </div>
              <h1 className="font-heading text-4xl font-black tracking-tight text-text-main md:text-6xl">
                O Skillsy é uma plataforma criada para transformar{" "}
                <span className="text-primary">talento</span>,{" "}
                <span className="text-primary">confiança</span> e{" "}
                <span className="text-primary">serviço</span> em conexões reais.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-muted md:text-xl">
                Mais do que um diretório de profissionais, o Skillsy nasce como
                uma iniciativa independente para aproximar pessoas, fortalecer
                relacionamentos de confiança e facilitar o encontro entre quem
                precisa de ajuda e quem pode servir com seu trabalho.
              </p>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-text-muted">
                O Skillsy não é afiliado nem representa oficialmente A Igreja de
                Jesus Cristo dos Santos dos Últimos Dias. A plataforma foi
                pensada como uma iniciativa da comunidade, guiada por valores de
                honestidade, respeito e apoio mútuo.
              </p>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className={`rounded-[2rem] border p-6 ${principle.tone}`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
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
          </section>

          <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <h2 className="font-heading text-3xl font-bold text-text-main">
                Nossa missão
              </h2>
              <p className="mt-5 text-base leading-relaxed text-text-muted md:text-lg">
                Criar um ambiente onde talentos locais possam ser vistos com
                mais clareza, onde famílias encontrem ajuda com mais confiança e
                onde o trabalho bem-feito se torne uma forma concreta de apoiar
                a comunidade.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-text-muted">
                Em termos práticos, isso significa aproximar pessoas, incentivar
                relações mais responsáveis e tornar mais fácil descobrir
                profissionais, serviços e oportunidades que talvez já estejam
                perto, mas ainda não estejam conectados.
              </p>

              <div className="mt-8 rounded-[2rem] border border-primary/10 bg-primary/5 p-6">
                <h3 className="text-lg font-bold text-text-main">
                  O que queremos fortalecer
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Queremos fortalecer uma cultura de indicação responsável,
                  reputação construída com experiência real, serviço prestado
                  com integridade e oportunidades que circulam dentro da própria
                  comunidade.
                </p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <h2 className="font-heading text-3xl font-bold text-text-main">
                O que o Skillsy é
              </h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border-subtle bg-surface p-5">
                  <h3 className="font-bold text-text-main">
                    Uma plataforma de conexões
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    A Skillsy ajuda pessoas a encontrar e apresentar serviços
                    com mais proximidade, contexto e confiança.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface p-5">
                  <h3 className="font-bold text-text-main">
                    Um espaço para visibilidade de talentos
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    Profissionais, empreendedores e pessoas com habilidades
                    úteis podem divulgar melhor aquilo que fazem.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface p-5">
                  <h3 className="font-bold text-text-main">
                    Uma iniciativa de apoio mútuo
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    Quando uma contratação acontece com confiança, mais gente é
                    beneficiada: quem presta o serviço, quem contrata e a rede
                    ao redor.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
            <div className="max-w-3xl">
              <h2 className="font-heading text-3xl font-bold text-text-main">
                Os valores que guiam a plataforma
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">
                O Skillsy cresce melhor quando a tecnologia serve a algo maior:
                relações mais honestas, trabalho mais digno e uma comunidade
                mais disposta a se apoiar.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-[2rem] border border-border-subtle bg-surface p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                    <value.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-text-main">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <h2 className="font-heading text-3xl font-bold text-text-main">
                O que o Skillsy não pretende ser
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-muted">
                <p>
                  A plataforma não pretende substituir o discernimento pessoal,
                  a conversa direta entre as partes ou a responsabilidade de
                  avaliar um serviço antes de contratar.
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

            <div className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <h2 className="font-heading text-3xl font-bold text-text-main">
                Como você pode participar
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-muted">
                <p>
                  Você pode participar divulgando seu trabalho, encontrando
                  profissionais, compartilhando a plataforma com outras pessoas
                  ou contribuindo para o fortalecimento da iniciativa.
                </p>
                <p>
                  Cada novo perfil relevante, cada contratação bem-feita e cada
                  recomendação responsável ajuda o Skillsy a cumprir melhor sua
                  missão.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/join"
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-4 text-base font-bold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Quero Participar
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link
                  href="/donation"
                  className="inline-flex items-center justify-center rounded-2xl border border-border-subtle bg-white px-6 py-4 text-base font-bold text-text-main transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Apoiar o Skillsy
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </main>
  );
}
