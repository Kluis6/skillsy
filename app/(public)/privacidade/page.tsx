import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Database, Eye, FileText, Lock, RefreshCcw, Share2, ShieldCheck, UserCheck } from "lucide-react";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Entenda quais dados a Skillsy trata, como eles são usados e quais direitos você pode exercer em relação à sua privacidade.",
};

const summaries = [
  {
    title: "Coleta responsável",
    description:
      "Tratamos dados de cadastro, perfil e uso da plataforma na medida necessária para a operação do Skillsy.",
    icon: Database,
    tone: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  {
    title: "Uso com finalidade clara",
    description:
      "Os dados ajudam a exibir perfis, facilitar conexões, proteger contas e manter a experiência funcionando.",
    icon: Eye,
    tone: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  {
    title: "Direitos do titular",
    description:
      "Você pode acessar, corrigir e solicitar exclusão de dados, observadas as hipóteses legais aplicáveis.",
    icon: UserCheck,
    tone: "bg-red-500/10 text-red-600 border-red-200",
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

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen w-full">
      <div className="relative h-[72vh] w-full bg-blue-700/75 bg-[url(public/Gemini_Generated_Image_d74ovcd74ovcd74o.png)] bg-cover bg-blend-multiply md:h-[78vh]">
        <div className="absolute left-4 top-28 z-40 w-xs -translate-y-1/2 md:left-6 md:w-sm xl:top-1/4">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white drop-shadow-xl md:text-3xl xl:text-4xl">
            Privacidade com <span className="text-red-500">clareza</span>,{" "}
            <span className="text-amber-400">cuidado</span> e{" "}
            <span className="text-blue-300">responsabilidade</span>.
          </h1>
        </div>

        <div className="absolute bottom-0 right-4 md:right-10 xl:right-24">
          <div className="relative h-72 w-56 overflow-hidden rounded-t-[8rem] shadow-2xl">
            <Image
              src="/Gemini_Generated_Image_mpk4kumpk4kumpk4.png"
              alt="Pessoa usando recursos digitais com segurança"
              className="object-cover"
              fill
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-lg bg-white p-4 shadow-2xl xl:p-8">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                <FileText size={14} />
                Política da plataforma
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Política de Privacidade</h2>
              <p className="text-base font-normal text-gray-800">
                Esta política explica quais dados a Skillsy pode tratar, por que eles são
                usados, com quem podem ser compartilhados e como você pode exercer seus direitos.
              </p>
              <p className="text-base font-normal text-gray-800">
                Nosso objetivo é tratar suas informações com clareza, cuidado e apenas na medida
                necessária para o funcionamento da plataforma.
              </p>
            </div>

            {summaries.map((item) => (
              <div
                key={item.title}
                className={`col-span-12 rounded-md border p-4 md:col-span-4 ${item.tone}`}
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-white shadow-2xl">
                  <item.icon size={22} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">{item.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
          <div className="col-span-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Quais dados podemos coletar</h2>
          </div>

          {dataTypes.map((item, index) => (
            <div key={item} className="col-span-12 md:col-span-4">
              <div className="h-full rounded-xl bg-blue-600 p-6 text-white">
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
                  Grupo {index + 1}
                </span>
                <p className="mt-3 text-sm font-normal text-blue-50">{item}</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Como usamos esses dados</h2>
                <p className="text-base font-normal text-gray-800">
                  O tratamento pode se apoiar em bases legais previstas na LGPD, como execução
                  dos serviços da plataforma, legítimo interesse compatível com a operação e,
                  quando aplicável, consentimento do titular.
                </p>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-700">Na prática, isso inclui</h3>
                  <p className="text-base font-normal text-gray-800">
                    Viabilizar login, exibir perfis, facilitar conexões, permitir contato entre
                    usuários e proteger a plataforma contra fraude, abuso e uso indevido.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-1 gap-4">
                {useCases.map((item) => (
                  <div key={item} className="rounded-md border bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700">
                        <Eye size={18} />
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                    </div>
                  </div>
                ))}
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
                Compartilhamento, retenção e segurança
              </h2>
              <p className="text-base font-normal text-gray-800">
                A Skillsy não comercializa dados pessoais para publicidade de terceiros e busca
                limitar o tratamento ao necessário para a operação da plataforma.
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-12 gap-4 gap-y-8">
              <div className="col-span-12 md:col-span-4">
                <div className="h-full space-y-2 rounded-md border bg-slate-50 p-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700">
                    <Share2 size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Compartilhamento</h3>
                  <p className="text-sm font-normal text-gray-700">
                    Dados públicos do perfil podem ser exibidos a outros usuários e dados
                    operacionais podem ser tratados por fornecedores essenciais da plataforma.
                  </p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="h-full space-y-2 rounded-md border bg-slate-50 p-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700">
                    <Lock size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Retenção</h3>
                  <p className="text-sm font-normal text-gray-700">
                    Os dados são mantidos pelo tempo necessário para cumprir as finalidades desta
                    política e atender exigências legais, regulatórias ou de defesa de direitos.
                  </p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="h-full space-y-2 rounded-md border bg-slate-50 p-4">
                  <div className="flex size-12 items-center justify-center rounded-sm bg-blue-700/10 text-blue-700">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">Segurança</h3>
                  <p className="text-sm font-normal text-gray-700">
                    Adotamos medidas razoáveis para reduzir riscos de acesso indevido, uso
                    inadequado e perda de dados, considerando o porte e a natureza do produto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-8 md:p-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Seus direitos e escolhas</h2>
              <p className="text-sm leading-relaxed text-gray-700">
                Nos termos da LGPD, você pode solicitar, conforme o caso:
              </p>
              <div className="space-y-3">
                {rights.map((item) => (
                  <div key={item} className="rounded-md border bg-white p-4 text-sm text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-7 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900">Atualizações e contato</h2>
            <div className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>
                Esta política pode ser revisada para refletir melhorias do produto, ajustes
                operacionais ou mudanças legais. A versão mais recente estará sempre disponível
                nesta página.
              </p>
              <p>
                Se você tiver dúvidas sobre esta política ou quiser exercer direitos relacionados
                aos seus dados, utilize os canais oficiais divulgados pela Skillsy dentro da
                própria plataforma.
              </p>
              <p>
                Para contexto complementar sobre funcionamento, responsabilidades e limites da
                plataforma, consulte também os{" "}
                <Link href="/termos" className="font-semibold text-blue-700 hover:underline">
                  Termos de Uso
                </Link>
                .
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950/90">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-sm bg-amber-100 text-amber-800">
                  <RefreshCcw size={18} />
                </div>
                <div>
                  <strong className="text-amber-900">Última atualização:</strong> 17 de abril de 2026.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
