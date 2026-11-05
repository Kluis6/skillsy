import {
  BLOCK_APPEAL_DAYS,
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  MINIMUM_AGE,
  OPPORTUNITY_DAYS,
  OPPORTUNITY_REMINDER_DAYS,
  REPORT_REVIEW_HOURS,
  TERMS_CHANGE_NOTICE_DAYS,
  TERMS_UPDATED_LABEL,
} from "@skillsy/shared/terms";
import type { LegalDocumentContent } from "./types";

export const TERMS: LegalDocumentContent = {
  title: "Termos de Uso",
  intro: [
    "Estes Termos de Uso são o contrato entre você e a Skillsy. Eles explicam como a plataforma funciona, o que a Skillsy faz e não faz, e quais responsabilidades são suas ao oferecer ou contratar serviços.",
    "Ao criar uma conta, você declara que leu e aceita estes termos e a Política de Privacidade. Quem apenas navega pela plataforma também deve respeitar estas regras.",
  ],
  summary: {
    title: "O essencial, em poucas linhas",
    items: [
      `O cadastro na Skillsy é permitido somente para maiores de ${MINIMUM_AGE} anos. Navegar pelo site não exige cadastro.`,
      "A Skillsy é e sempre será gratuita para os usuários.",
      "A Skillsy apenas aproxima pessoas: não participa de pagamentos, da execução nem do agendamento de serviços.",
      "Toda a responsabilidade pelos serviços combinados e pelos dados informados é dos próprios usuários.",
      "A Skillsy não se responsabiliza por infrações, danos ou condutas dos seus usuários.",
      "Conteúdo impróprio não é permitido: quem publicar tem o perfil removido.",
      "Conteúdo contrário à lei ou a estas regras bloqueia o perfil até ser removido e pode levar ao banimento.",
    ],
  },
  sections: [
    {
      id: "sobre",
      title: "Sobre a Skillsy e estes termos",
      blocks: [
        { type: "p", text: "A Skillsy é uma plataforma de conexões: ajuda profissionais a apresentar seus serviços e pessoas a encontrar quem precisam, com indicações e avaliações da comunidade." },
        { type: "p", text: `A Skillsy é mantida por ${CONTROLLER_NAME}, pessoa física responsável pela plataforma, com quem você celebra este contrato.` },
        { type: "p", text: "A Skillsy é uma iniciativa independente. Não é afiliada, administrada, patrocinada nem endossada por A Igreja de Jesus Cristo dos Santos dos Últimos Dias, e não representa alas, estacas, unidades locais ou departamentos da Igreja." },
        { type: "p", text: "Estes termos seguem a legislação brasileira, incluindo o Código de Defesa do Consumidor, o Marco Civil da Internet e a Lei Geral de Proteção de Dados Pessoais (LGPD)." },
      ],
    },
    {
      id: "quem-pode-usar",
      title: "Quem pode se cadastrar",
      blocks: [
        { type: "callout", tone: "warning", title: `Cadastro permitido somente para maiores de ${MINIMUM_AGE} anos`, items: [
          `Para criar uma conta você precisa ter ${MINIMUM_AGE} anos ou mais. Ao se cadastrar, você declara cumprir essa exigência.`,
          "Navegar pelo site e consultar perfis, oportunidades, artigos e vagas não exige cadastro.",
          "Contas de menores de idade são removidas assim que identificadas.",
        ] },
        { type: "list", items: [
          "Os dados informados devem ser verdadeiros.",
          "Uma conta por pessoa. A conta é pessoal e não pode ser transferida.",
          "A plataforma é voltada a serviços prestados no Brasil.",
        ] },
      ],
    },
    {
      id: "gratuidade",
      title: "Gratuidade",
      blocks: [
        { type: "callout", tone: "info", items: [
          "O uso da Skillsy é e sempre será gratuito para os usuários: criar conta, anunciar serviços, buscar profissionais, publicar oportunidades, indicar, avaliar e ler artigos e vagas.",
          "A Skillsy não cobra comissão sobre os serviços combinados entre usuários.",
        ] },
      ],
    },
    {
      id: "como-funciona",
      title: "Como a plataforma funciona",
      blocks: [
        { type: "list", items: [
          "Perfis: quem anuncia serviços cria um perfil público com nome, foto, serviço, cidade, contato e galeria de fotos.",
          "Contato: as conversas acontecem diretamente entre as pessoas, geralmente pelo WhatsApp, fora da plataforma.",
          "Indicações e avaliações: membros indicam profissionais de confiança e avaliam serviços que contrataram.",
          `Oportunidades: quem precisa de um serviço pode publicar um pedido no Mural. Ele fica disponível por ${OPPORTUNITY_DAYS} dias, os profissionais da mesma categoria e estado recebem um aviso, e o autor recebe um lembrete aos ${OPPORTUNITY_REMINDER_DAYS} dias. O WhatsApp do autor fica visível para os profissionais enquanto o pedido estiver ativo.`,
          "Artigos e vagas: membros verificados podem publicar artigos e vagas. A equipe pode destacar, rejeitar ou retirar publicações que violem estas regras.",
          "Avisos: a plataforma envia notificações no próprio site e app e, se você permitir no celular, notificações push sobre oportunidades, artigos e vagas. As notificações push podem ser desativadas nas configurações do celular.",
        ] },
      ],
    },
    {
      id: "papel-da-skillsy",
      title: "O papel da Skillsy e os limites da sua responsabilidade",
      blocks: [
        { type: "callout", tone: "warning", title: "A Skillsy não participa dos serviços combinados entre usuários", items: [
          "Não intermedeia, recebe ou garante pagamentos.",
          "Não executa, não supervisiona e não fiscaliza os serviços.",
          "Não agenda serviços nem controla prazos, horários ou entregas.",
          "Não emprega, não seleciona e não certifica os profissionais anunciados.",
        ] },
        { type: "p", text: "Por isso, a Skillsy não se responsabiliza por:" },
        { type: "list", items: [
          "Infrações, atos ilícitos ou condutas inadequadas cometidas pelos usuários, dentro ou fora da plataforma.",
          "Qualidade, preço, prazo, segurança ou resultado dos serviços contratados.",
          "Pagamentos, cobranças, reembolsos, danos, prejuízos, acidentes ou desentendimentos entre usuários, inclusive os que aconteçam pelo WhatsApp, por telefone ou pessoalmente.",
          "A veracidade das informações publicadas pelos usuários: perfis, avaliações, indicações, oportunidades, artigos e vagas.",
        ] },
        { type: "p", text: "Essas limitações valem na máxima extensão permitida pela lei. Nada nestes termos afasta a responsabilidade da Skillsy nos casos em que a lei não permite essa exclusão." },
        { type: "p", text: "A Skillsy se compromete a manter a plataforma funcionando com cuidado e segurança, proteger os dados pessoais conforme a Política de Privacidade e analisar as denúncias recebidas. A plataforma pode ficar indisponível durante manutenções ou por falhas técnicas." },
      ],
    },
    {
      id: "responsabilidades-do-usuario",
      title: "Responsabilidades do usuário",
      blocks: [
        { type: "callout", tone: "warning", title: "Toda a responsabilidade pelos serviços e pelos dados informados é do usuário", items: [
          "Quem oferece serviços responde pela execução, qualidade, segurança, preço e prazo do que combinar.",
          "Quem contrata responde pelo que acertar com o profissional, incluindo pagamento e condições.",
          "Cada usuário responde pela veracidade e legalidade dos dados que informa e de tudo o que publica.",
        ] },
        { type: "list", items: [
          "Cumprir as exigências legais da sua atividade, como impostos, licenças e registros profissionais.",
          "Publicar apenas fotos e textos sobre os quais tenha direitos, ou com autorização das pessoas que aparecem neles.",
          "Publicar somente vagas reais, sem discriminação de qualquer natureza (Lei nº 9.029/1995) e sem cobrar nada dos candidatos.",
          "Manter a senha da conta em sigilo e avisar a Skillsy sobre qualquer uso indevido.",
        ] },
      ],
    },
    {
      id: "dados-de-filiacao-religiosa",
      title: "Dados de filiação religiosa",
      blocks: [
        { type: "callout", tone: "info", title: "Consentimento específico", items: [
          "Informar a ala e o ano de batismo é opcional. Esses dados indicam filiação religiosa e são considerados dados pessoais sensíveis pela LGPD.",
          "Ao informá-los no seu perfil, você consente, de forma específica, que a Skillsy os trate para confirmar o selo de membro verificado e para exibi-los no seu perfil, que é público quando você anuncia serviços.",
          "Você pode retirar esse consentimento a qualquer momento, apagando a ala e o ano de batismo em Editar perfil. O selo de membro verificado deixa de aparecer.",
        ] },
        { type: "p", text: "O selo de membro verificado confirma apenas os dados informados pelo próprio usuário. Ele não é uma certificação de competência, idoneidade ou qualidade do serviço." },
      ],
    },
    {
      id: "conteudo",
      title: "Conteúdo publicado e propriedade intelectual",
      blocks: [
        { type: "list", items: [
          "O conteúdo que você publica continua sendo seu. Ao publicá-lo, você autoriza a Skillsy, de forma gratuita, a hospedá-lo, exibi-lo e adaptá-lo ao formato da plataforma (site, app e notificações), enquanto ele estiver publicado.",
          "A Skillsy só usa o seu perfil, fotos ou depoimentos em divulgações fora da plataforma, como redes sociais, com a sua autorização.",
          "A marca, o nome, o visual e o código da Skillsy pertencem à Skillsy e não podem ser usados sem autorização.",
        ] },
      ],
    },
    {
      id: "condutas-proibidas",
      title: "O que não é permitido",
      blocks: [
        { type: "callout", tone: "warning", title: "Conteúdo impróprio não é permitido na Skillsy", items: [
          "Quem publicar conteúdo sexual, violento, que incentive ódio ou que viole direitos autorais tem o perfil removido da plataforma.",
          "Qualquer outro conteúdo contrário à lei ou a estas regras bloqueia o perfil até ser removido e pode levar ao banimento.",
        ] },
        { type: "table", head: ["Conduta", "Exemplos"], rows: [
          ["Perfil falso ou enganoso", "Usar nome, foto ou dados de outra pessoa, ou prometer formação, registro ou experiência que não tem."],
          ["Avaliações e indicações falsas", "Avaliar ou indicar a si mesmo, combinar avaliações, oferecer vantagem em troca de nota ou criar contas para isso."],
          ["Atividades ilegais", "Serviços ilícitos, produtos proibidos, pirâmides financeiras e “investimentos” com promessa de retorno."],
          ["Golpes e fraude", "Cobrar sem prestar o serviço, pedir pagamento adiantado de má-fé ou usar a plataforma para obter dados ou dinheiro de terceiros."],
          ["Desrespeito", "Assédio, ameaça, discriminação ou linguagem ofensiva, inclusive em conversas iniciadas pela Skillsy, como no WhatsApp."],
          ["Spam", "Publicações repetidas, propaganda sem relação com a proposta da plataforma e mensagens em massa."],
          ["Dados de terceiros", "Publicar telefone, endereço, fotos ou informações de outras pessoas sem autorização."],
          ["Uso indevido de nomes e marcas", "Dar a entender que a Skillsy, um anúncio ou um perfil é oficial ou endossado por qualquer instituição, inclusive a Igreja e suas unidades."],
          ["Conteúdo impróprio", "Conteúdo sexual, violento, que incentive ódio ou que viole direitos autorais."],
          ["Prejudicar a plataforma", "Tentar invadir, copiar dados em massa, burlar bloqueios ou criar outra conta depois de uma remoção."],
        ] },
      ],
    },
    {
      id: "denuncias-e-bloqueio",
      title: "Denúncias, bloqueio e remoção de perfis",
      blocks: [
        { type: "callout", tone: "warning", title: "Conteúdo contrário à lei ou às regras leva ao bloqueio, à remoção ou ao banimento do perfil", items: [
          "Qualquer usuário pode denunciar um perfil ou uma publicação pelo botão Denunciar.",
          `A equipe analisa as denúncias em até ${REPORT_REVIEW_HOURS} horas, sempre que possível. Quem denuncia não é identificado para a pessoa denunciada.`,
          "Confirmada a violação, o perfil é bloqueado, removido ou banido, conforme a gravidade.",
        ] },
        { type: "table", head: ["Medida", "Quando", "O que acontece"], rows: [
          ["Bloqueio até a remoção do conteúdo", "Publicar perfil, foto, avaliação, indicação, oportunidade, artigo ou vaga contrários à lei ou a estas regras.", "O perfil é bloqueado e sai das buscas até que o conteúdo seja removido. Para isso, peça a revisão pela tela de conta bloqueada: a equipe remove o conteúdo ou libera o acesso para que você o retire."],
          ["Remoção do perfil", "Conteúdo impróprio (sexual, violento, de ódio ou que viole direitos autorais), fraude, golpe, ameaça, assédio grave, perfil falso ou atividade ilegal.", "O perfil é removido da plataforma."],
          ["Banimento", "Reincidência depois de um bloqueio ou de uma remoção, ou infração grave que coloque pessoas em risco.", "A conta é encerrada definitivamente e não é permitido criar outra."],
        ] },
        { type: "list", items: [
          "Infrações graves, como golpe, ameaça ou risco à segurança de alguém, levam ao bloqueio imediato, sem aviso prévio. Quando necessário, as informações são preservadas e encaminhadas às autoridades.",
          `Quem tiver a conta bloqueada vê o motivo ao entrar e pode pedir revisão em até ${BLOCK_APPEAL_DAYS} dias, pela própria tela de conta bloqueada. A decisão da revisão é final.`,
          "Denúncia falsa, feita de má-fé, também é infração.",
          "Avaliações e indicações não são removidas por serem negativas, apenas quando violam estas regras.",
        ] },
      ],
    },
    {
      id: "cancelamento",
      title: "Cancelamento da conta e mudanças no serviço",
      blocks: [
        { type: "list", items: [
          "Você pode cancelar a sua conta a qualquer momento, nas configurações do perfil. Seus dados pessoais são apagados, com as exceções descritas na Política de Privacidade.",
          "A Skillsy pode alterar, suspender ou encerrar funcionalidades. Se a plataforma for encerrada, os usuários serão avisados com antecedência.",
        ] },
      ],
    },
    {
      id: "alteracoes",
      title: "Alterações destes termos",
      blocks: [
        { type: "p", text: `Mudanças relevantes nestes termos ou na Política de Privacidade são avisadas com pelo menos ${TERMS_CHANGE_NOTICE_DAYS} dias de antecedência, na plataforma. Quando a mudança exigir, será pedido um novo aceite ao entrar.` },
      ],
    },
    {
      id: "disposicoes-gerais",
      title: "Disposições gerais",
      blocks: [
        { type: "list", items: [
          "Estes termos são regidos pela legislação brasileira. Fica eleito o foro do domicílio do usuário para resolver qualquer questão.",
          "Se alguma cláusula for considerada inválida, as demais continuam valendo.",
          "Se a Skillsy deixar de exigir alguma regra em um caso, isso não significa que abriu mão dela.",
          "Se estes termos forem traduzidos, a versão em português prevalece.",
          `Dúvidas e solicitações: Fale conosco, na página inicial, ou pelo e-mail ${CONTACT_EMAIL}. Denúncias: botão Denunciar, no perfil ou na publicação.`,
        ] },
      ],
    },
    {
      id: "seguranca",
      title: "Dicas de segurança",
      blocks: [
        { type: "list", items: [
          "Combine por escrito o serviço, o preço e o prazo antes de começar.",
          "Desconfie de pedidos de pagamento total adiantado.",
          "Não compartilhe senhas nem códigos recebidos por SMS.",
          "Avalie depois do serviço e use o botão Denunciar diante de qualquer comportamento suspeito.",
        ] },
      ],
    },
  ],
  updatedAt: TERMS_UPDATED_LABEL,
};
