import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { PixCopyField } from "@/components/donation/pix-copy-field";
import { createPublicMetadata } from "@/lib/public-metadata";
import { LuHandshake, LuLightbulb } from "react-icons/lu";

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
const PIX_KEY =
  "00020126330014BR.GOV.BCB.PIX0111103710237185204000053039865802BR5924LUIS ANTONIO DE OLIVEIRA6015DUQUE DE CAXIAS62070503***6304B4C4";
const PIX_KEY_TYPE = "CPF/CNPJ";
const PIX_QR_CODE_SRC = "/WhatsApp Image 2026-05-28 at 16.02.56.jpeg";

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
    icon: LuLightbulb,
    tone: "bg-highlight/5 text-highlight",
  },
  {
    title: "Apoio com Transparência",
    description:
      "A doação é voluntária e existe para sustentar a iniciativa com responsabilidade, sem promessas exageradas ou vantagens ocultas.",
    icon: LuHandshake,
    tone: "bg-red-500/5 text-red-500",
  },
];

export default function DonationPage() {
  const hasQrCode = Boolean(PIX_QR_CODE_SRC);

  return (
    <div className="min-h-screen bg-surface w-full pb-8">
      <section className="relative h-[45vh] md:h-[50vh] w-full bg-cover bg-right md:bg-center object-fill bg-[url(/donate.png)]">
        <div className={`absolute inset-0 bg-blue-700/30 brightness-30`}></div>
        <div className="space-y-4 p-4 container mx-auto flex flex-col items-start md:justify-center h-full w-full">
          <div className="space-y-2 bg-gray-700/40 shadow-md p-4 backdrop-blur-xs rounded">
            <h2 className="text-xl lg:text-4xl font-bold text-white">
              Sua contribuição pode ajudar!
            </h2>
            <p className="text-base lg:text-xl text-white">
              Ajudar a Skillsy a continuar fortalecendo conexões reais.
            </p>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 isolate -mt-8 ">
        <section className="relative overflow-hidden rounded-xl border bg-white p-4 md:p-6 lg:p-10 shadow-2xl mb-8">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Apoio Voluntário
            </h2>
            <p className="text-base font-normal text-gray-700">
              O Skillsy é uma iniciativa independente criada para conectar
              pessoas, talentos e oportunidades dentro de uma rede de confiança.
              Se você acredita nesse propósito, sua doação pode ajudar a manter
              e melhorar a plataforma.
            </p>
          </div>
          <section className="grid grid-cols-12 gap-4 lg:gap-8 my-8">
            {impactItems.map((item) => (
              <div
                key={item.title}
                className={`rounded-md col-span-12 lg:col-span-4 border p-4 lg:p-6 bg-white space-y-4`}
              >
                <div
                  className={`flex h-12 w-12 shadow-md items-center justify-center rounded-sm ${item.tone}`}
                >
                  <item.icon size={22} />
                </div>
                <div className="">
                  <h2 className="text-lg lg:text-xl font-bold text-text-main">
                    {item.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-12 gap-4 gap-y-8 lg:gap-8 my-16">
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div className="flex items-center gap-3">
                <div className="md:flex hidden h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <QrCode size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-text-main">
                    Doe com QR Code Pix
                  </h2>
                  <p className="text-sm text-text-muted">
                    Escaneie com o app do seu banco para contribuir.
                  </p>
                </div>
              </div>

              {hasQrCode ? (
                <div className="mx-auto flex size-70 shadow-lg lg:size-80 items-center justify-center rounded-md overflow-hidden border">
                  {/* Substitua PIX_QR_CODE_SRC pelo caminho real da imagem do QR Code */}
                  <Image
                    src={PIX_QR_CODE_SRC}
                    alt="QR Code Pix para apoiar o Skillsy"
                    width={280}
                    height={280}
                    className="h-auto w-full"
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

              <p className="text-sm leading-relaxed text-text-muted">
                Antes de confirmar qualquer pagamento, confira se os dados do
                recebedor estão corretos no seu banco.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div className="flex items-center gap-3">
                <div className="md:flex hidden h-12 w-12 items-center justify-center rounded-md bg-highlight/10 text-highlight">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-text-main">
                    Opção de Pix Copia e Cola
                  </h2>
                  <p className="text-sm text-text-muted">
                    Use os dados abaixo para doar manualmente.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border bg-surface p-4">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Recebedor
                  </span>
                  <p className="text-sm font-medium text-text-main">
                    {PIX_BENEFICIARY}
                  </p>
                </div>

                <div className="rounded-xl border bg-surface p-4">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Tipo de chave
                  </span>
                  <p className="text-sm font-medium text-text-main">
                    {PIX_KEY_TYPE}
                  </p>
                </div>

                <PixCopyField pixKey={PIX_KEY} />
              </div>
            </div>
          </section>

          <div className=" border border-yellow-200  bg-yellow-50 p-4 w-full mb-8">
            <h3 className="text-lg font-bold text-yellow-900">Importante</h3>
            <p className="mt-2 text-sm leading-relaxed text-yellow-800">
              A doação é espontânea e não concede prioridade em resultados,
              benefícios exclusivos, posição de destaque ou qualquer tipo de
              favorecimento dentro da plataforma.
            </p>
          </div> 

          <section className=" space-y-4">
            <h2 className="lg:text-2xl text-xl font-bold text-gray-900">
              Antes de doar
            </h2>
            <div className="space-y-2 text-sm leading-relaxed text-text-muted">
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
        </section>

        <div className="p-4 bg-yellow-50 border border-yellow-200">
          <p className="text-sm font-normal text-yellow-800">
            As contribuições são voluntárias e não representam vínculo
            institucional. <br /> O Skillsy não é afiliado nem representa
            oficialmente A Igreja de Jesus Cristo dos Santos dos Últimos Dias.
          </p>
        </div>
      </div>
    </div>
  );
}
