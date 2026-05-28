import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  HeartHandshake,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { createPublicMetadata } from "@/lib/public-metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Apoie o Skillsy",
  description:
    "Contribua com o Skillsy e ajude a manter a plataforma, melhorar a experiência e fortalecer a comunidade.",
  path: "/donation",
  imageTitle: "Apoie o Skillsy",
  imageDescription:
    "Sua contribuição pode ajudar a manter a plataforma, ampliar melhorias e fortalecer a comunidade.",
  imageLabel: "Doação",
});

const PIX_BENEFICIARY = "Luis Antonio de Oliveira Julio";
const PIX_KEY = "sua-chave-pix-aqui";
const PIX_KEY_TYPE = "E-mail, telefone, CPF/CNPJ ou chave aleatória";
const PIX_QR_CODE_SRC = "";

const impactItems = [
  {
    title: "Infraestrutura & Operação",
    description:
      "Sua ajuda pode contribuir com hospedagem, banco de dados, manutenção técnica e continuidade da plataforma.",
    icon: Wallet,
    tone: "bg-primary/5 text-primary border-primary/10",
  },
  {
    title: "Melhorias do Produto",
    description:
      "As contribuições ajudam a desenvolver novos recursos, corrigir problemas e tornar a experiência mais útil para todos.",
    icon: BadgeCheck,
    tone: "bg-highlight/5 text-highlight border-highlight/10",
  },
  {
    title: "Apoio com Transparência",
    description:
      "A doação é voluntária e existe para sustentar a iniciativa com responsabilidade, sem promessas exageradas ou vantagens ocultas.",
    icon: ShieldCheck,
    tone: "bg-surface text-text-main border-border-subtle",
  },
];

export default function DonationPage() {
  const hasQrCode = Boolean(PIX_QR_CODE_SRC);

  return (
    <div className="min-h-screen bg-surface w-full">
      <section className="relative h-[30vh] md:h-[50vh] w-full bg-cover bg-center object-fill bg-[url(/Gemini_Generated_Image_kwyhw5kwyhw5kwyh.png)] ">
        <div className={`absolute inset-0 bg-blue-700/30 brightness-30`}></div>
        <div className="space-y-4 p-4 container mx-auto flex flex-col items-start justify-center h-full w-full">
          <div className="space-y-2 bg-gray-700/40 shadow-md p-4 backdrop-blur-xs rounded">
            <h2 className="text-xl lg:text-4xl font-bold text-white ">
             Sua contribuição pode ajudar!
            </h2>
            <p className="text-base lg:text-xl text-white ">
              Ajudar a Skillsy a continuar fortalecendo conexões reais.
            </p>
          </div>
        </div>
      </section>
      <main className="px-4 pb-20 pt-32">
        <div className="container mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-12 shadow-sm">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
            <div className="relative z-10 max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <HeartHandshake size={14} />
                Apoio Voluntário
              </div>
              <h1 className="font-heading text-4xl font-black tracking-tight text-text-main md:text-6xl">
                Sua contribuição pode ajudar o{" "}
                <span className="text-primary">Skillsy</span> a continuar
                fortalecendo conexões reais.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
                O Skillsy é uma iniciativa independente criada para conectar
                pessoas, talentos e oportunidades dentro de uma rede de
                confiança. Se você acredita nesse propósito, sua doação pode
                ajudar a manter e melhorar a plataforma.
              </p>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-text-muted">
                As contribuições são voluntárias e não representam vínculo
                institucional. O Skillsy não é afiliado nem representa
                oficialmente A Igreja de Jesus Cristo dos Santos dos Últimos
                Dias.
              </p>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {impactItems.map((item) => (
              <div
                key={item.title}
                className={`rounded-[2rem] border p-6 ${item.tone}`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                  <item.icon size={22} />
                </div>
                <h2 className="mb-3 text-xl font-bold text-text-main">
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <QrCode size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-text-main">
                    Doe com QR Code Pix
                  </h2>
                  <p className="text-sm text-text-muted">
                    Escaneie com o app do seu banco para contribuir.
                  </p>
                </div>
              </div>

              {hasQrCode ? (
                <div className="mx-auto flex max-w-sm items-center justify-center rounded-[2rem] border border-border-subtle bg-white p-6">
                  {/* Substitua PIX_QR_CODE_SRC pelo caminho real da imagem do QR Code */}
                  <Image
                    src={PIX_QR_CODE_SRC}
                    alt="QR Code Pix para apoiar o Skillsy"
                    width={280}
                    height={280}
                    className="h-auto w-full max-w-[280px] rounded-xl"
                  />
                </div>
              ) : (
                <div className="mx-auto flex min-h-[320px] max-w-sm flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border-subtle bg-surface p-8 text-center">
                  <QrCode size={56} className="mb-4 text-text-muted" />
                  <h3 className="text-lg font-bold text-text-main">
                    Área reservada para o QR Code Pix
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    Quando a imagem estiver pronta, adicione o arquivo e
                    preencha a constante <code>PIX_QR_CODE_SRC</code> nesta
                    página.
                  </p>
                </div>
              )}

              <p className="mt-5 text-sm leading-relaxed text-text-muted">
                Antes de confirmar qualquer pagamento, confira se os dados do
                recebedor estão corretos no seu banco.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-highlight/10 text-highlight">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-text-main">
                    Opção de Pix Copia e Cola
                  </h2>
                  <p className="text-sm text-text-muted">
                    Use os dados abaixo para doar manualmente.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Recebedor
                  </span>
                  <p className="text-sm font-medium text-text-main">
                    {PIX_BENEFICIARY}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Tipo de chave
                  </span>
                  <p className="text-sm font-medium text-text-main">
                    {PIX_KEY_TYPE}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface p-4">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Chave Pix
                  </span>
                  <code className="block break-all rounded-xl bg-white px-3 py-3 text-sm text-text-main">
                    {PIX_KEY}
                  </code>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-primary/10 bg-primary/5 p-5">
                <h3 className="text-lg font-bold text-text-main">Importante</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  A doação é espontânea e não concede prioridade em resultados,
                  benefícios exclusivos, posição de destaque ou qualquer tipo de
                  favorecimento dentro da plataforma.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-text-main">
              Como sua contribuição ajuda
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border-subtle bg-surface p-5">
                <h3 className="font-bold text-text-main">
                  Manter o que já funciona
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Ajuda a sustentar custos recorrentes da plataforma e garantir
                  estabilidade para quem usa o Skillsy no dia a dia.
                </p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-surface p-5">
                <h3 className="font-bold text-text-main">
                  Evoluir com responsabilidade
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Permite priorizar melhorias que aumentem confiança,
                  organização, visibilidade e segurança para a comunidade.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-border-subtle bg-white p-6">
              <h3 className="text-lg font-bold text-text-main">
                Transparência e confiança
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                Se você quiser, esta página também pode evoluir para incluir
                prestação de contas, metas de arrecadação, histórico de apoio ou
                atualizações periódicas sobre o uso das contribuições.
              </p>
            </div>
          </section>

          <section className="mt-12 rounded-[2.5rem] border border-border-subtle bg-card p-8 md:p-10 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-text-main">
              Antes de doar
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-muted">
              <p>
                Verifique sempre os dados do recebedor no app do seu banco antes
                de concluir a transferência.
              </p>
              <p>
                Em caso de dúvidas sobre privacidade, uso da plataforma ou
                limites da iniciativa, consulte nossa{" "}
                <Link
                  href="/privacidade"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Política de Privacidade
                </Link>{" "}
                e os{" "}
                <Link
                  href="/termos"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Termos de Uso
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
