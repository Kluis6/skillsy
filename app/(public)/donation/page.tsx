import type { Metadata } from "next";
import { FeatureCard } from "@/components/ui/feature-card";
import HeaderSection from "@/components/headersection";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Equal,
  QrCode,
  Rocket,
  Server,
  Wallet,
} from "lucide-react";
import { PixCopyField } from "@/components/donation/pix-copy-field";
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
  heroImage: "donation",
});

const PIX_KEY =
  "00020126330014BR.GOV.BCB.PIX0111103710237185204000053039865802BR5924LUIS ANTONIO DE OLIVEIRA6015DUQUE DE CAXIAS62070503***6304B4C4";
const PIX_QR_CODE_SRC = "/WhatsApp Image 2026-05-28 at 16.02.56.jpeg";

const impactItems = [
  {
    title: "Manter a plataforma no ar",
    description:
      "Ajuda com hospedagem, banco de dados, manutenção técnica e continuidade dos perfis públicos.",
    icon: Server,
  },
  {
    title: "Melhorar a experiência",
    description:
      "Contribui para filtros melhores, compartilhamento, perfil público, segurança e correções importantes.",
    icon: Rocket,
  },
  {
    title: "Apoio sem favorecimento",
    description:
      "A doação é voluntária e não compra destaque, prioridade, selo ou qualquer vantagem dentro do Skillsy.",
    icon: Equal,
  },
];

export default function DonationPage() {
  const hasQrCode = Boolean(PIX_QR_CODE_SRC);

  return (
    <main className="min-h-screen w-full bg-surface pb-10">
      <HeaderSection
        backgroundImageSrc="/donate.png"
        backgroundImageAlt="Pessoa usando tecnologia para apoiar conexões na comunidade"
        headlineSegments={[
          { text: "Ajude o Skillsy a continuar conectando pessoas reais." },
        ]}
        description="Sua contribuição ajuda a manter a plataforma disponível, melhorar os perfis públicos e fortalecer conexões com mais contexto e confiança."
      />

      <div className="container mx-auto isolate -mt-8 space-y-10 px-4">
        <section className="border border-border-subtle bg-card p-5 md:p-6 lg:p-8 shadow-xs">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-main md:text-2xl">
              Doar é uma forma simples de sustentar a rede.
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-text-muted">
              O Skillsy é uma iniciativa independente criada para conectar
              pessoas, talentos e oportunidades dentro de uma rede de
              confiança. Se você acredita nesse propósito, sua doação pode
              ajudar a manter e melhorar a plataforma.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-4 lg:gap-6">
          {impactItems.map((item) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              titleAs="h2"
              className="col-span-12 md:col-span-4"
            />
          ))}
        </section>

        <section className="grid grid-cols-12 gap-4 gap-y-8 lg:gap-6">
          <div className="col-span-12 border border-border-subtle bg-card p-5 md:p-6 lg:col-span-6 lg:p-8 shadow-xs">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="md:flex hidden h-12 w-12 items-center justify-center bg-primary/10 text-primary">
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
                <div className="mx-auto flex size-70 lg:size-80 items-center justify-center overflow-hidden border border-border-subtle">
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
                <div className="mx-auto flex min-h-[320px] max-w-sm flex-col items-center justify-center border-2 border-dashed border-border-subtle bg-surface p-8 text-center">
                  <QrCode size={56} className="mb-4 text-text-muted" />
                  <h3 className="text-lg font-bold text-text-main">
                    Área reservada para o QR Code Pix
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    Quando a imagem estiver pronta, adicione o arquivo e preencha
                    a constante <code>PIX_QR_CODE_SRC</code> nesta página.
                  </p>
                </div>
              )}

              <p className="text-sm leading-relaxed text-text-muted">
                Antes de confirmar qualquer pagamento, confira se os dados do
                recebedor estão corretos no seu banco.
              </p>
            </div>
          </div>

          <div className="col-span-12 border border-border-subtle bg-card p-5 md:p-6 lg:col-span-6 lg:p-8 shadow-xs">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="md:flex hidden h-12 w-12 items-center justify-center bg-highlight/10 text-highlight">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-text-main">
                    Opção de Pix Copia e Cola
                  </h2>
                  <p className="text-sm text-text-muted">
                    Copie o código e cole na área Pix do app do seu banco.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <PixCopyField pixKey={PIX_KEY} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-warning-border bg-warning-surface p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <h3 className="text-lg font-bold text-warning-foreground">
                  Importante
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-warning-foreground">
                  A doação é espontânea e não concede prioridade em resultados,
                  benefícios exclusivos, posição de destaque ou qualquer tipo de
                  favorecimento dentro da plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border-subtle bg-card p-5 shadow-xs">
            <h2 className="text-xl font-bold text-text-main">Antes de doar</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-text-muted">
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
              <p>
                As contribuições são voluntárias e não representam vínculo
                institucional. O Skillsy não é afiliado nem representa
                oficialmente A Igreja de Jesus Cristo dos Santos dos Últimos
                Dias.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
