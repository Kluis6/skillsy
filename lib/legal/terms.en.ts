import {
  BLOCK_APPEAL_DAYS,
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  MINIMUM_AGE,
  OPPORTUNITY_DAYS,
  OPPORTUNITY_REMINDER_DAYS,
  REPORT_REVIEW_HOURS,
  TERMS_CHANGE_NOTICE_DAYS,
} from "@skillsy/shared/terms";
import type { LegalDocumentContent } from "./types";

// English translation of terms.ts (first version, to be reviewed). Section ids
// stay the same in every language: other pages link to them.
export const TERMS_EN: Omit<LegalDocumentContent, "updatedAt"> = {
  title: "Terms of Use",
  intro: [
    "These Terms of Use are the agreement between you and Skillsy. They explain how the platform works, what Skillsy does and doesn't do, and what you're responsible for when you offer or hire services.",
    "By creating an account, you confirm that you have read and accept these terms and the Privacy Policy. People who only browse the platform must also follow these rules.",
  ],
  summary: {
    title: "The essentials, in a few lines",
    items: [
      `Only people ${MINIMUM_AGE} or older can sign up for Skillsy. Browsing the site doesn't require an account.`,
      "Skillsy is and always will be free for users.",
      "Skillsy only brings people together: it isn't involved in payments, in carrying out services or in scheduling them.",
      "Users are fully responsible for the services they agree on and the information they provide.",
      "Skillsy isn't responsible for violations, damages or conduct of its users.",
      "Inappropriate content isn't allowed: whoever posts it has their profile removed.",
      "Content against the law or these rules blocks the profile until it's removed and may lead to a ban.",
    ],
  },
  sections: [
    {
      id: "sobre",
      title: "About Skillsy and these terms",
      blocks: [
        { type: "p", text: "Skillsy is a connection platform: it helps professionals present their services and helps people find who they need, with recommendations and reviews from the community." },
        { type: "p", text: `Skillsy is run by ${CONTROLLER_NAME}, the individual responsible for the platform, with whom you enter into this agreement.` },
        { type: "p", text: "Skillsy is an independent initiative. It is not affiliated with, run, sponsored or endorsed by The Church of Jesus Christ of Latter-day Saints, and it doesn't represent wards, stakes, local units or departments of the Church." },
        { type: "p", text: "These terms follow Brazilian law, including the Consumer Protection Code (Código de Defesa do Consumidor), the Brazilian Internet Bill of Rights (Marco Civil da Internet) and the General Personal Data Protection Law (LGPD)." },
      ],
    },
    {
      id: "quem-pode-usar",
      title: "Who can sign up",
      blocks: [
        { type: "callout", tone: "warning", title: `Only people ${MINIMUM_AGE} or older can sign up`, items: [
          `You must be ${MINIMUM_AGE} or older to create an account. By signing up, you confirm that you meet this requirement.`,
          "Browsing the site and viewing profiles, opportunities, articles and jobs doesn't require an account.",
          "Accounts belonging to minors are removed as soon as they're identified.",
        ] },
        { type: "list", items: [
          "The information you provide must be true.",
          "One account per person. Accounts are personal and can't be transferred.",
          "The platform is meant for services provided in Brazil.",
        ] },
      ],
    },
    {
      id: "gratuidade",
      title: "Free of charge",
      blocks: [
        { type: "callout", tone: "info", items: [
          "Using Skillsy is and always will be free for users: creating an account, advertising services, finding professionals, posting opportunities, recommending, reviewing and reading articles and jobs.",
          "Skillsy doesn't charge a commission on services agreed between users.",
        ] },
      ],
    },
    {
      id: "como-funciona",
      title: "How the platform works",
      blocks: [
        { type: "list", items: [
          "Profiles: people who advertise services create a public profile with their name, photo, service, city, contact and photo gallery.",
          "Contact: conversations happen directly between people, usually on WhatsApp, outside the platform.",
          "Recommendations and reviews: members recommend professionals they trust and review services they hired.",
          `Opportunities: anyone who needs a service can post a request on the Board. It stays available for ${OPPORTUNITY_DAYS} days, professionals in the same category and state get a notification, and the author gets a reminder after ${OPPORTUNITY_REMINDER_DAYS} days. The author's WhatsApp number is visible to professionals while the request is open.`,
          "Articles and jobs: verified members can post articles and jobs. The team can feature, reject or take down posts that break these rules.",
          "Notifications: the platform sends notifications on the site and app and, if you allow it on your phone, push notifications about opportunities, articles and jobs. Push notifications can be turned off in your phone's settings.",
        ] },
      ],
    },
    {
      id: "papel-da-skillsy",
      title: "Skillsy's role and the limits of its responsibility",
      blocks: [
        { type: "callout", tone: "warning", title: "Skillsy isn't part of the services agreed between users", items: [
          "It doesn't handle, receive or guarantee payments.",
          "It doesn't carry out, supervise or inspect services.",
          "It doesn't schedule services or control deadlines, times or deliveries.",
          "It doesn't employ, select or certify the professionals listed.",
        ] },
        { type: "p", text: "For this reason, Skillsy isn't responsible for:" },
        { type: "list", items: [
          "Violations, unlawful acts or inappropriate conduct by users, on or off the platform.",
          "The quality, price, deadline, safety or result of the services hired.",
          "Payments, charges, refunds, damages, losses, accidents or disagreements between users, including those that happen on WhatsApp, by phone or in person.",
          "Whether the information posted by users is true: profiles, reviews, recommendations, opportunities, articles and jobs.",
        ] },
        { type: "p", text: "These limitations apply to the fullest extent permitted by law. Nothing in these terms excludes Skillsy's responsibility where the law doesn't allow that exclusion." },
        { type: "p", text: "Skillsy commits to keeping the platform running with care and security, protecting personal data as described in the Privacy Policy and reviewing the reports it receives. The platform may be unavailable during maintenance or because of technical failures." },
      ],
    },
    {
      id: "responsabilidades-do-usuario",
      title: "User responsibilities",
      blocks: [
        { type: "callout", tone: "warning", title: "Users are fully responsible for their services and the information they provide", items: [
          "Those who offer services are responsible for how they carry them out, and for the quality, safety, price and deadline they agree on.",
          "Those who hire are responsible for what they agree with the professional, including payment and conditions.",
          "Each user is responsible for the accuracy and legality of the information they provide and everything they post.",
        ] },
        { type: "list", items: [
          "Meet the legal requirements of your activity, such as taxes, licenses and professional registrations.",
          "Only post photos and texts you have rights to, or that the people shown in them have authorized.",
          "Only post real jobs, without discrimination of any kind (Brazilian Law No. 9,029/1995) and without charging candidates anything.",
          "Keep your account password secret and let Skillsy know about any misuse.",
        ] },
      ],
    },
    {
      id: "dados-de-filiacao-religiosa",
      title: "Religious affiliation data",
      blocks: [
        { type: "callout", tone: "info", title: "Specific consent", items: [
          "Entering your ward and baptism year is optional. This information shows religious affiliation and is considered sensitive personal data under the LGPD.",
          "By entering it in your profile, you specifically consent to Skillsy processing it to confirm the verified member badge and to show your ward on your profile, visible only to people signed in to the platform.",
          "You can withdraw this consent at any time by deleting your ward and baptism year in Edit profile. The verified member badge then stops appearing.",
        ] },
        { type: "p", text: "The verified member badge only confirms the information provided by the user. It isn't a certification of competence, integrity or service quality." },
      ],
    },
    {
      id: "conteudo",
      title: "Posted content and intellectual property",
      blocks: [
        { type: "list", items: [
          "The content you post remains yours. By posting it, you authorize Skillsy, free of charge, to host, display and adapt it to the platform's format (site, app and notifications) for as long as it's posted.",
          "Skillsy only uses your profile, photos or testimonials in promotion outside the platform, such as social media, with your permission.",
          "Skillsy's brand, name, look and code belong to Skillsy and can't be used without permission.",
        ] },
      ],
    },
    {
      id: "condutas-proibidas",
      title: "What isn't allowed",
      blocks: [
        { type: "callout", tone: "warning", title: "Inappropriate content isn't allowed on Skillsy", items: [
          "Anyone who posts sexual or violent content, content that encourages hatred or content that infringes copyright has their profile removed from the platform.",
          "Any other content against the law or these rules blocks the profile until it's removed and may lead to a ban.",
        ] },
        { type: "table", head: ["Conduct", "Examples"], rows: [
          ["Fake or misleading profile", "Using someone else's name, photo or details, or claiming training, registration or experience you don't have."],
          ["Fake reviews and recommendations", "Reviewing or recommending yourself, arranging reviews, offering something in exchange for a rating or creating accounts to do so."],
          ["Illegal activities", "Unlawful services, prohibited products, pyramid schemes and “investments” that promise returns."],
          ["Scams and fraud", "Charging without providing the service, asking for advance payment in bad faith or using the platform to get data or money from others."],
          ["Disrespect", "Harassment, threats, discrimination or offensive language, including in conversations started through Skillsy, such as on WhatsApp."],
          ["Spam", "Repeated posts, advertising unrelated to the platform's purpose and mass messages."],
          ["Other people's data", "Posting other people's phone numbers, addresses, photos or information without permission."],
          ["Misuse of names and brands", "Implying that Skillsy, a listing or a profile is official or endorsed by any institution, including the Church and its units."],
          ["Inappropriate content", "Sexual or violent content, content that encourages hatred or content that infringes copyright."],
          ["Harming the platform", "Trying to break in, copying data in bulk, getting around blocks or creating another account after a removal."],
        ] },
      ],
    },
    {
      id: "denuncias-e-bloqueio",
      title: "Reports, blocking and removal of profiles",
      blocks: [
        { type: "callout", tone: "warning", title: "Content against the law or the rules leads to the profile being blocked, removed or banned", items: [
          "Any user can report a profile or a post with the Report button.",
          `The team reviews reports within ${REPORT_REVIEW_HOURS} hours whenever possible. The person who reports isn't identified to the person reported.`,
          "Once a violation is confirmed, the profile is blocked, removed or banned, depending on how serious it is.",
        ] },
        { type: "table", head: ["Measure", "When", "What happens"], rows: [
          ["Blocked until the content is removed", "Posting a profile, photo, review, recommendation, opportunity, article or job that is against the law or these rules.", "The profile is blocked and leaves search results until the content is removed. To do this, ask for a review on the blocked account screen: the team removes the content or restores access so you can take it down."],
          ["Profile removal", "Inappropriate content (sexual, violent, hateful or copyright-infringing), fraud, scams, threats, serious harassment, fake profiles or illegal activity.", "The profile is removed from the platform."],
          ["Ban", "Repeat violations after a block or a removal, or a serious violation that puts people at risk.", "The account is closed permanently and creating another one isn't allowed."],
        ] },
        { type: "list", items: [
          "Serious violations, such as scams, threats or risks to someone's safety, lead to an immediate block without prior notice. When necessary, the information is preserved and passed on to the authorities.",
          `Anyone whose account is blocked sees the reason when they sign in and can ask for a review within ${BLOCK_APPEAL_DAYS} days, on the blocked account screen itself. The review decision is final.`,
          "A false report made in bad faith is also a violation.",
          "Reviews and recommendations aren't removed for being negative, only when they break these rules.",
        ] },
      ],
    },
    {
      id: "cancelamento",
      title: "Canceling your account and changes to the service",
      blocks: [
        { type: "list", items: [
          "You can cancel your account at any time in your profile settings. Your personal data is deleted, with the exceptions described in the Privacy Policy.",
          "Skillsy may change, suspend or end features. If the platform shuts down, users will be notified in advance.",
        ] },
      ],
    },
    {
      id: "alteracoes",
      title: "Changes to these terms",
      blocks: [
        { type: "p", text: `Significant changes to these terms or to the Privacy Policy are announced on the platform at least ${TERMS_CHANGE_NOTICE_DAYS} days in advance. When the change requires it, you'll be asked to accept again when you sign in.` },
      ],
    },
    {
      id: "disposicoes-gerais",
      title: "General provisions",
      blocks: [
        { type: "list", items: [
          "These terms are governed by Brazilian law. Any dispute will be settled in the courts of the user's place of residence.",
          "If any clause is found invalid, the others remain in effect.",
          "If Skillsy doesn't enforce a rule in one case, that doesn't mean it has waived it.",
          "If these terms are translated, the Portuguese version prevails.",
          `Questions and requests: Contact us, on the home page, or by email at ${CONTACT_EMAIL}. Reports: the Report button, on the profile or the post.`,
        ] },
      ],
    },
    {
      id: "seguranca",
      title: "Safety tips",
      blocks: [
        { type: "list", items: [
          "Agree on the service, price and deadline in writing before starting.",
          "Be wary of requests for full payment in advance.",
          "Don't share passwords or codes received by text message.",
          "Leave a review after the service and use the Report button if you notice any suspicious behavior.",
        ] },
      ],
    },
  ],
};
