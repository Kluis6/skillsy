import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  RefreshCcw,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { createPublicMetadata } from "@/lib/public-metadata";
import {
  BLOCK_APPEAL_DAYS,
  MINIMUM_AGE,
  REPORT_REVIEW_HOURS,
  TERMS_UPDATED_LABEL,
} from "@skillsy/shared/terms";
import HeaderSection, {
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
  heroImage: "termos",
});

const flow = [
  "Você cria um perfil com suas informações, área de atuação e formas de contato.",
  "Outros usuários podem encontrar seu perfil e iniciar uma conversa de forma direta.",
  "Serviço, valores, prazos e demais condições são acertados exclusivamente entre cliente e prestador.",
];

const eligibility = [
  `Ter ${MINIMUM_AGE} anos ou mais e informar dados verdadeiros.`,
  "Uma conta por pessoa. A conta é pessoal e não pode ser transferida.",
  "O selo de membro verificado confirma apenas os dados informados pelo próprio usuário (ala e ano de batismo). Não é certificação de competência, idoneidade ou qualidade do serviço.",
];

const prohibited = [
  { title: "Perfil falso ou enganoso", text: "Usar nome, foto ou dados de outra pessoa, ou prometer formação, registro ou experiência que não tem." },
  { title: "Avaliações e indicações falsas", text: "Avaliar ou indicar a si mesmo, combinar avaliações, oferecer vantagem em troca de nota ou criar contas para isso." },
  { title: "Atividades ilegais", text: "Serviços ilícitos, produtos proibidos, pirâmides financeiras e “investimentos” com promessa de retorno." },
  { title: "Golpes e fraude", text: "Cobrar sem prestar o serviço, pedir pagamento adiantado de má-fé ou usar a plataforma para obter dados ou dinheiro de terceiros." },
  { title: "Desrespeito", text: "Assédio, ameaça, discriminação ou linguagem ofensiva, inclusive em conversas iniciadas pela Skillsy, como no WhatsApp." },
  { title: "Spam", text: "Publicações repetidas, propaganda sem relação com a proposta da plataforma e mensagens em massa." },
  { title: "Dados de terceiros", text: "Publicar telefone, endereço, fotos ou informações de outras pessoas sem autorização." },
  { title: "Uso indevido de nomes e marcas", text: "Dar a entender que a Skillsy, um anúncio ou um perfil é oficial ou endossado por qualquer instituição, inclusive a Igreja e suas unidades." },
  { title: "Conteúdo impróprio", text: "Conteúdo sexual, violento, que incentive ódio ou que viole direitos autorais." },
  { title: "Prejudicar a plataforma", text: "Tentar invadir, copiar dados em massa, burlar bloqueios ou criar outra conta depois de uma remoção." },
];

const sanctions = [
  { level: "1", title: "Ajuste", when: "Informação incorreta ou conteúdo fora da proposta.", action: "Aviso e pedido de correção. O conteúdo pode ficar oculto até ser corrigido." },
  { level: "2", title: "Remoção de conteúdo", when: "Avaliação, indicação, artigo, vaga ou oportunidade que viole as regras.", action: "O conteúdo é removido ou rejeitado, com o motivo informado." },
  { level: "3", title: "Suspensão", when: "Repetição de infrações ou infração moderada.", action: "A conta é bloqueada e o perfil sai das buscas." },
  { level: "4", title: "Remoção da conta", when: "Fraude, golpe, ameaça, assédio grave, perfil falso, atividade ilegal ou reincidência após suspensão.", action: "A conta é encerrada e não é permitido criar outra." },
];

const enforcementNotes = [
  "Infrações graves, como golpe, ameaça ou risco à segurança de alguém, levam ao bloqueio imediato, sem aviso prévio. Quando necessário, as informações são preservadas e encaminhadas às autoridades.",
  `Denúncias são analisadas em até ${REPORT_REVIEW_HOURS} horas, sempre que possível. Quem denuncia não é identificado para a pessoa denunciada. Denúncia falsa, feita de má-fé, também é infração.`,
  `Quem tiver a conta bloqueada vê o motivo ao entrar e pode pedir revisão em até ${BLOCK_APPEAL_DAYS} dias, pela própria tela de conta bloqueada. A decisão da revisão é final.`,
  "Avaliações e indicações não são removidas por serem negativas, apenas quando violam estas regras.",
];

const platformLimits = [
  "Não emprega, seleciona, supervisiona nem certifica os profissionais anunciados.",
  "Não intermedeia pagamentos, não cobra comissão e não participa dos acordos entre usuários.",
  "Não garante a qualidade, o prazo, o preço ou o resultado dos serviços, nem que alguém vá contratar ou ser contratado.",
  "Não responde por danos, prejuízos, atrasos, acidentes ou desentendimentos decorrentes de serviços, pagamentos ou contatos entre usuários, inclusive os que aconteçam fora da plataforma (WhatsApp, telefone ou pessoalmente).",
  "Não confere as informações publicadas pelos usuários (perfis, avaliações, indicações, vagas, artigos e oportunidades), que são de responsabilidade de quem as publicou.",
];

const platformCommitments = [
  "Manter a plataforma funcionando com cuidado e segurança. Ela pode ficar indisponível durante manutenções ou por falhas técnicas.",
  "Proteger os dados pessoais conforme a Política de Privacidade.",
  "Analisar as denúncias recebidas e agir conforme estas regras.",
];

const safetyTips = [
  "Combine por escrito o serviço, o preço e o prazo antes de começar.",
  "Desconfie de pedidos de pagamento total adiantado.",
  "Não compartilhe senhas nem códigos recebidos por SMS.",
  "Avalie depois do serviço e use o botão Denunciar diante de qualquer comportamento suspeito.",
];

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: "Regras para usar o Skillsy com" },
  { text: " respeito", className: "text-white" },
  { text: " e " },
  { text: "responsabilidade", className: "text-white" },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_sneeobsneeobsnee.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full bg-card p-4 shadow-sm xl:p-8 border border-border-subtle">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Termos de Uso
              </h2>
              <p className="text-base font-normal text-text-muted">
                Estes termos explicam como a Skillsy funciona, o que você pode
                esperar da plataforma e quais responsabilidades continuam sendo
                suas ao contratar ou oferecer serviços.
              </p>
              <p className="text-base font-normal text-text-muted">
                Ao acessar ou usar a Skillsy, você concorda com estas regras. Se
                não concordar, recomendamos não utilizar a plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
          <div className="col-span-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">
              Independência institucional
            </h2>
          </div>

          <div className="col-span-12">
            <div className="border border-border-subtle bg-surface p-4 md:p-6 lg:p-8 space-y-4">
              <div className="space-y-4">
                <p className="text-base leading-relaxed text-text-muted">
                  A <strong>Skillsy</strong> é uma iniciativa independente,
                  criada para facilitar conexões profissionais e apoio mútuo
                  entre membros da comunidade.
                </p>
                <div className="border border-warning-border bg-warning-surface p-5 text-sm leading-relaxed text-warning-foreground">
                  <strong className="text-warning-foreground">Aviso importante:</strong>{" "}
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
                <h2 className="text-lg lg:text-xl font-bold text-text-main">
                  Como a Skillsy funciona
                </h2>
                <p className="text-base font-normal text-text-muted">
                  A Skillsy atua como um diretório de conexões. A plataforma
                  ajuda usuários a apresentar seus serviços, encontrar
                  profissionais e iniciar contato com mais facilidade.
                </p>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-main">
                    Fluxo básico de uso
                  </h3>
                  <p className="text-base font-normal text-text-muted">
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
                  <div key={item} className="border border-border-subtle bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-text-muted">
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
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Quem pode usar
              </h2>
              <p className="text-base font-normal text-text-muted">
                A Skillsy é uma rede de confiança. Por isso, cada conta
                representa uma pessoa real e responsável pelo que publica.
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4">
              {eligibility.map((item) => (
                <p
                  key={item}
                  className="border border-border-subtle bg-surface p-4 text-sm leading-relaxed text-text-muted"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="my-24 bg-surface">
        <div className="container mx-auto px-4 py-18 space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl lg:text-2xl font-bold text-text-main">
              O que não é permitido
            </h2>
            <p className="text-base text-text-muted">
              Estas condutas levam às medidas descritas na seção seguinte.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {prohibited.map((item, index) => (
              <div key={item.title} className="flex gap-3 border border-border-subtle bg-card p-4">
                <div className="flex size-10 shrink-0 items-center justify-center bg-destructive/10 text-sm font-bold text-destructive">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-text-main">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto my-24 px-4 space-y-8">
        <div className="space-y-2">
          <h2 className="text-xl lg:text-2xl font-bold text-text-main">
            Bloqueio e remoção de perfis
          </h2>
          <p className="text-base text-text-muted">
            As medidas são proporcionais à gravidade da infração e ao histórico
            de quem a cometeu.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sanctions.map((item) => (
            <div key={item.level} className="space-y-3 border border-border-subtle bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                  {item.level}
                </div>
                <h3 className="font-bold text-text-main">{item.title}</h3>
              </div>
              <p className="text-sm text-text-muted">
                <strong className="text-text-main">Quando:</strong> {item.when}
              </p>
              <p className="text-sm text-text-muted">
                <strong className="text-text-main">Medida:</strong> {item.action}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-3 border border-warning-border bg-warning-surface p-5 text-sm leading-relaxed text-warning-foreground">
          {enforcementNotes.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="my-24 bg-surface">
        <div className="container mx-auto px-4 py-18">
          <div className="grid grid-cols-12 gap-4 lg:gap-8">
            <div className="col-span-12 lg:col-span-4">
              <div className="space-y-4">
                <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                  Responsabilidades
                </h2>
                <p className="text-base font-normal text-text-muted">
                  A Skillsy é um espaço de conexão: ajuda as pessoas a se
                  encontrarem, mas não faz parte das negociações entre elas.
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-6 h-full space-y-3 border border-border-subtle bg-card p-4">
                <h3 className="text-lg font-bold text-text-main">A Skillsy</h3>
                {platformLimits.map((item) => (
                  <p key={item} className="text-sm leading-relaxed text-text-muted">
                    {item}
                  </p>
                ))}
              </div>
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                <div className="space-y-3 border border-border-subtle bg-card p-4">
                  <h3 className="text-lg font-bold text-text-main">Cada usuário</h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    É responsável pelo que publica, pelo que combina com outros
                    usuários e pelas consequências legais dos seus atos, incluindo
                    impostos, licenças e registros profissionais exigidos para a
                    sua atividade.
                  </p>
                </div>
                <div className="space-y-3 border border-border-subtle bg-card p-4">
                  <h3 className="text-lg font-bold text-text-main">
                    A Skillsy se compromete a
                  </h3>
                  {platformCommitments.map((item) => (
                    <p key={item} className="text-sm leading-relaxed text-text-muted">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto my-24 px-4 space-y-6">
        <h2 className="text-xl lg:text-2xl font-bold text-text-main">
          Dicas de segurança
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {safetyTips.map((item) => (
            <p key={item} className="border border-border-subtle bg-surface p-4 text-sm leading-relaxed text-text-muted">
              {item}
            </p>
          ))}
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="border border-border-subtle bg-surface p-4 md:p-6 lg:p-10">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Privacidade e dados
              </h2>
              <p className="text-sm leading-relaxed text-text-muted">
                O tratamento dos seus dados pessoais segue a nossa Política de
                Privacidade, que explica quais informações podem ser coletadas,
                como são usadas e quais escolhas você tem dentro da plataforma.
              </p>
              <p className="text-sm leading-relaxed text-text-muted">
                Para entender melhor esse tratamento, consulte a{" "}
                <Link
                  href="/privacidade"
                  className="font-semibold text-primary hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="space-y-7 p-4 md:p-6 lg:p-10">
            <h2 className="text-xl lg:text-2xl font-bold text-text-main">
              Atualizações e contato
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-text-muted">
              <p>
                Estes termos podem ser atualizados para refletir melhorias,
                ajustes operacionais ou mudanças legais. O uso continuado da
                plataforma após a publicação de uma nova versão indica que você
                tomou conhecimento do texto atualizado.
              </p>
              <p>
                Dúvidas sobre estes termos podem ser enviadas pelo{" "}
                <Link href="/#fale-conosco" className="font-semibold text-primary hover:underline">
                  Fale conosco
                </Link>{" "}
                da página inicial. Para denunciar um perfil ou uma publicação,
                use o botão Denunciar na própria página.
              </p>
            </div>

            <div className="border border-warning-border bg-warning-surface p-5 text-sm leading-relaxed text-warning-foreground">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center bg-warning/15 text-warning">
                    <RefreshCcw size={18} />
                  </div>
                  <div>
                    <strong className="text-warning-foreground">
                      Última atualização:
                    </strong>{" "}
                    <br />
                    {TERMS_UPDATED_LABEL}.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center bg-warning/15 text-warning">
                    <Mail size={18} />
                  </div>
                  <div>
                    Dúvidas e solicitações pelo Fale conosco; denúncias pelo
                    botão Denunciar.
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
