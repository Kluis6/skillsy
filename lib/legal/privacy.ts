import {
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  MINIMUM_AGE,
  PRIVACY_REPLY_DAYS,
  TERMS_CHANGE_NOTICE_DAYS,
  TERMS_UPDATED_LABEL,
} from "@skillsy/shared/terms";
import type { LegalDocumentContent } from "./types";

export const PRIVACY: LegalDocumentContent = {
  title: "Política de Privacidade",
  intro: [
    "Esta política explica quais dados pessoais a Skillsy trata, para quê, o que fica público, com quem os dados são compartilhados e como você exerce os seus direitos, conforme a Lei Geral de Proteção de Dados Pessoais (LGPD).",
  ],
  summary: {
    title: "O essencial, em poucas linhas",
    items: [
      `O cadastro na Skillsy é permitido somente para maiores de ${MINIMUM_AGE} anos.`,
      "Tratamos só os dados necessários para a plataforma funcionar e não vendemos dados pessoais.",
      "O perfil de quem anuncia serviços é público na internet, inclusive o WhatsApp informado, e pode aparecer em buscadores como o Google.",
      "Ala e ano de batismo são opcionais e só são tratados com o seu consentimento.",
      "Você pode corrigir, apagar dados ou cancelar a conta quando quiser.",
      `Pedidos sobre os seus dados: ${CONTACT_EMAIL}.`,
    ],
  },
  sections: [
    {
      id: "controlador",
      title: "Quem trata os seus dados",
      blocks: [
        { type: "p", text: `A Skillsy é mantida por ${CONTROLLER_NAME}, pessoa física responsável pela plataforma e controlador dos dados pessoais tratados nela. Para qualquer assunto sobre privacidade, inclusive o exercício dos seus direitos, escreva para ${CONTACT_EMAIL} ou use o Fale conosco na página inicial.` },
      ],
    },
    {
      id: "dados-coletados",
      title: "Quais dados tratamos",
      blocks: [
        { type: "table", head: ["Tipo", "Exemplos"], rows: [
          ["Cadastro", "Nome, e-mail, foto da conta Google (se você entrar com o Google) e identificadores da conta."],
          ["Perfil", "Foto, capa, biografia, serviço e categoria, empresa, cidade e estado, dias e horários de atendimento, WhatsApp, telefone, redes sociais, site e galeria de fotos."],
          ["Filiação religiosa (dado sensível)", "Ala, ano de batismo e se você é membro ou amigo da comunidade. São opcionais."],
          ["Atividade na plataforma", "Indicações, avaliações, contatos salvos, oportunidades, artigos e vagas que você publica, denúncias e mensagens enviadas pelo Fale conosco."],
          ["Aparelhos e avisos", "Identificador do celular para notificações push, quando você permite, e as notificações recebidas."],
          ["Registros da conta", "Versão dos Termos de Uso aceita e a data do aceite, além do motivo e da data de um eventual bloqueio."],
        ] },
      ],
    },
    {
      id: "finalidades",
      title: "Para que usamos e com qual base legal",
      blocks: [
        { type: "table", head: ["Finalidade", "Base legal (LGPD)"], rows: [
          ["Criar e manter a sua conta, exibir perfis, permitir buscas, contatos, indicações, avaliações, oportunidades, artigos e vagas", "Execução do contrato (art. 7º, V)"],
          ["Enviar avisos de oportunidades, artigos e vagas no site, no app e por push", "Execução do contrato (art. 7º, V)"],
          ["Confirmar o selo de membro verificado e exibir ala e ano de batismo no perfil", "Consentimento específico (art. 11, I), dado ao informar esses dados"],
          ["Prevenir fraudes, spam e abusos, analisar denúncias e manter a segurança", "Legítimo interesse (art. 7º, IX)"],
          ["Guardar registros exigidos por lei e defender direitos em processos", "Obrigação legal e exercício regular de direitos (art. 7º, II e VI)"],
        ] },
      ],
    },
    {
      id: "o-que-e-publico",
      title: "O que fica público",
      blocks: [
        { type: "callout", tone: "warning", title: "Perfis de quem anuncia serviços são públicos", items: [
          "Nome, foto, capa, serviço, empresa, cidade e estado, biografia, galeria, atendimento, contatos informados (inclusive o WhatsApp), selo de membro verificado, avaliações e indicações recebidas.",
          "A ala só aparece para quem está logado na plataforma.",
          "Esses perfis podem ser vistos por qualquer pessoa, mesmo sem conta, e podem aparecer em buscadores como o Google.",
          "Para deixar de ter um perfil público, desative \"Anunciar meus serviços\" em Editar perfil ou cancele a conta.",
        ] },
        { type: "list", items: [
          "Indicações e avaliações que você faz mostram o seu nome e a sua foto para quem visita o perfil avaliado.",
          "Oportunidades ativas, incluindo o WhatsApp do autor, ficam visíveis para quem usa a plataforma.",
          "Artigos e vagas publicados mostram o nome do autor.",
        ] },
      ],
    },
    {
      id: "compartilhamento",
      title: "Com quem compartilhamos",
      blocks: [
        { type: "p", text: "A Skillsy não vende nem aluga dados pessoais e não os usa para publicidade de terceiros. Os dados são tratados por fornecedores que operam a plataforma em nosso nome:" },
        { type: "table", head: ["Fornecedor", "Para quê"], rows: [
          ["Google (Firebase)", "Login, banco de dados, armazenamento de imagens, funções do servidor e notificações push."],
          ["Google (login)", "Entrar com a conta Google, quando você escolhe essa opção."],
          ["Vercel", "Hospedagem do site."],
          ["ViaCEP e OpenStreetMap", "Preencher endereço e localização a partir do CEP ou da sua localização, quando você usa essa função."],
          ["jsDelivr", "Entrega de um componente usado para reduzir o tamanho das imagens que você envia."],
        ] },
        { type: "p", text: "Também podemos compartilhar dados com autoridades públicas quando houver obrigação legal ou ordem judicial, ou para proteger a segurança de pessoas." },
      ],
    },
    {
      id: "onde-ficam",
      title: "Onde os seus dados ficam",
      blocks: [
        { type: "p", text: "O banco de dados da Skillsy fica no Brasil (São Paulo). As imagens enviadas e a hospedagem do site ficam em servidores nos Estados Unidos, operados pelo Google e pela Vercel, que adotam padrões de segurança e cláusulas de proteção de dados compatíveis com a LGPD (art. 33)." },
      ],
    },
    {
      id: "retencao",
      title: "Por quanto tempo guardamos",
      blocks: [
        { type: "p", text: "Os dados ficam guardados enquanto a sua conta estiver ativa. Quando você cancela a conta:" },
        { type: "list", items: [
          "São apagados: perfil público, foto, capa, biografia, contatos, galeria, serviço, endereço, ala, ano de batismo e demais dados do perfil.",
          "São mantidos: o e-mail e o registro de que a conta foi cancelada, para evitar fraudes e permitir defesa em eventuais disputas, além de denúncias e registros de segurança pelo tempo exigido por lei.",
          "Indicações e avaliações que você fez em perfis de outras pessoas continuam visíveis, porque fazem parte da reputação desses profissionais. Você pode pedir a remoção delas pelo e-mail de contato.",
        ] },
      ],
    },
    {
      id: "seguranca",
      title: "Segurança",
      blocks: [
        { type: "p", text: "Usamos medidas técnicas para proteger os dados, como conexões criptografadas, regras de acesso que limitam quem pode ler e alterar cada informação e registros de atividade. Nenhum sistema é totalmente imune a falhas; em caso de incidente que possa trazer risco aos titulares, avisaremos os afetados e a Autoridade Nacional de Proteção de Dados (ANPD), como exige a LGPD." },
      ],
    },
    {
      id: "direitos",
      title: "Seus direitos",
      blocks: [
        { type: "list", items: [
          "Confirmar se tratamos dados seus e acessá-los.",
          "Corrigir dados incompletos, inexatos ou desatualizados. A maioria pode ser corrigida por você mesmo, em Editar perfil.",
          "Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desacordo com a LGPD.",
          "Pedir a portabilidade dos seus dados.",
          "Saber com quem os seus dados são compartilhados.",
          "Retirar o consentimento dado para os dados de filiação religiosa, apagando-os em Editar perfil.",
          "Pedir a eliminação dos dados e cancelar a conta, nas configurações do perfil.",
        ] },
        { type: "p", text: `Pedidos podem ser enviados para ${CONTACT_EMAIL}. Respondemos em até ${PRIVACY_REPLY_DAYS} dias. Você também pode reclamar à ANPD.` },
      ],
    },
    {
      id: "cookies",
      title: "Cookies e armazenamento no navegador",
      blocks: [
        { type: "list", items: [
          "Essenciais: mantêm você conectado e protegem a conta. Sem eles, a plataforma não funciona.",
          "Preferências: lembram escolhas como tema claro ou escuro. Só são gravados depois da sua escolha no aviso de cookies, e recusá-los não impede o uso da plataforma.",
          "A Skillsy não usa cookies de publicidade nem ferramentas de análise de terceiros. Se isso mudar, esta política será atualizada e o seu consentimento será pedido antes.",
        ] },
      ],
    },
    {
      id: "menores",
      title: "Menores de idade",
      blocks: [
        { type: "p", text: `O cadastro na Skillsy é permitido somente para pessoas com ${MINIMUM_AGE} anos ou mais, e a plataforma não coleta, de forma intencional, dados de menores. Navegar pelo site não exige cadastro. Se identificarmos uma conta de menor de idade, ela será removida.` },
      ],
    },
    {
      id: "alteracoes",
      title: "Alterações desta política",
      blocks: [
        { type: "p", text: `Mudanças relevantes são avisadas na plataforma com pelo menos ${TERMS_CHANGE_NOTICE_DAYS} dias de antecedência e, quando necessário, será pedido um novo aceite. A versão mais recente está sempre nesta página.` },
      ],
    },
  ],
  updatedAt: TERMS_UPDATED_LABEL,
};
