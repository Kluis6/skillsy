import {
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  MINIMUM_AGE,
  PRIVACY_REPLY_DAYS,
  TERMS_CHANGE_NOTICE_DAYS,
} from "@skillsy/shared/terms";
import type { LegalDocumentContent } from "./types";

// English translation of privacy.ts (first version, to be reviewed). Section
// ids stay the same in every language.
export const PRIVACY_EN: Omit<LegalDocumentContent, "updatedAt"> = {
  title: "Privacy Policy",
  intro: [
    "This policy explains what personal data Skillsy processes, why, what is public, who the data is shared with and how you exercise your rights, under Brazil's General Personal Data Protection Law (LGPD).",
  ],
  summary: {
    title: "The essentials, in a few lines",
    items: [
      `Only people ${MINIMUM_AGE} or older can sign up for Skillsy.`,
      "We only process the data the platform needs to work, and we don't sell personal data.",
      "The profile of anyone who advertises services is public on the internet, including the WhatsApp number provided, and may appear in search engines such as Google.",
      "Ward and baptism year are optional and are only processed with your consent.",
      "You can correct or delete data, or cancel your account, whenever you want.",
      `Requests about your data: ${CONTACT_EMAIL}.`,
    ],
  },
  sections: [
    {
      id: "controlador",
      title: "Who processes your data",
      blocks: [
        { type: "p", text: `Skillsy is run by ${CONTROLLER_NAME}, the individual responsible for the platform and the controller of the personal data processed on it. For any privacy matter, including exercising your rights, write to ${CONTACT_EMAIL} or use Contact us on the home page.` },
      ],
    },
    {
      id: "dados-coletados",
      title: "What data we process",
      blocks: [
        { type: "table", head: ["Type", "Examples"], rows: [
          ["Sign-up", "Name, email, Google account photo (if you sign in with Google) and account identifiers."],
          ["Profile", "Photo, cover, bio, service and category, company, city and state, service days and hours, WhatsApp, phone, social media, website and photo gallery."],
          ["Religious affiliation (sensitive data)", "Ward, baptism year and whether you are a member or a friend of the community. These are optional."],
          ["Activity on the platform", "Recommendations, reviews, saved contacts, opportunities, articles and jobs you post, reports and messages sent through Contact us."],
          ["Devices and notifications", "Phone identifier for push notifications, when you allow them, and the notifications you receive."],
          ["Account records", "The version of the Terms of Use you accepted and the date you accepted it, plus the reason and date of any block."],
        ] },
      ],
    },
    {
      id: "finalidades",
      title: "What we use it for and on what legal basis",
      blocks: [
        { type: "table", head: ["Purpose", "Legal basis (LGPD)"], rows: [
          ["Creating and maintaining your account, showing profiles, enabling searches, contacts, recommendations, reviews, opportunities, articles and jobs", "Performance of a contract (art. 7, V)"],
          ["Sending notifications about opportunities, articles and jobs on the site, the app and by push", "Performance of a contract (art. 7, V)"],
          ["Confirming the verified member badge and showing your ward and baptism year on your profile", "Specific consent (art. 11, I), given when you enter this information"],
          ["Preventing fraud, spam and abuse, reviewing reports and keeping the platform secure", "Legitimate interest (art. 7, IX)"],
          ["Keeping records required by law and defending rights in legal proceedings", "Legal obligation and regular exercise of rights (art. 7, II and VI)"],
        ] },
      ],
    },
    {
      id: "o-que-e-publico",
      title: "What is public",
      blocks: [
        { type: "callout", tone: "warning", title: "Profiles of people who advertise services are public", items: [
          "Name, photo, cover, service, company, city and state, bio, gallery, service hours, contacts provided (including WhatsApp), verified member badge, and the reviews and recommendations received.",
          "The ward is only shown to people signed in to the platform.",
          "Anyone can see these profiles, even without an account, and they may appear in search engines such as Google.",
          "To stop having a public profile, turn off \"Advertise my services\" in Edit profile or cancel your account.",
        ] },
        { type: "list", items: [
          "The recommendations and reviews you make show your name and photo to people who visit the profile you reviewed.",
          "Open opportunities, including the author's WhatsApp number, are visible to people who use the platform.",
          "Published articles and jobs show the author's name.",
        ] },
      ],
    },
    {
      id: "compartilhamento",
      title: "Who we share it with",
      blocks: [
        { type: "p", text: "Skillsy doesn't sell or rent personal data and doesn't use it for third-party advertising. The data is processed by providers that run the platform on our behalf:" },
        { type: "table", head: ["Provider", "What for"], rows: [
          ["Google (Firebase)", "Sign-in, database, image storage, server functions and push notifications."],
          ["Google (sign-in)", "Signing in with your Google account, when you choose that option."],
          ["Vercel", "Website hosting."],
          ["ViaCEP and OpenStreetMap", "Filling in your address and location from your ZIP code (CEP) or your location, when you use that feature."],
          ["jsDelivr", "Delivering a component used to reduce the size of the images you upload."],
        ] },
        { type: "p", text: "We may also share data with public authorities when there is a legal obligation or a court order, or to protect people's safety." },
      ],
    },
    {
      id: "onde-ficam",
      title: "Where your data is stored",
      blocks: [
        { type: "p", text: "Skillsy's database is in Brazil (São Paulo). Uploaded images and the website hosting are on servers in the United States, run by Google and Vercel, which follow security standards and data protection clauses compatible with the LGPD (art. 33)." },
      ],
    },
    {
      id: "retencao",
      title: "How long we keep it",
      blocks: [
        { type: "p", text: "Data is kept while your account is active. When you cancel your account:" },
        { type: "list", items: [
          "Deleted: public profile, photo, cover, bio, contacts, gallery, service, address, ward, baptism year and other profile data.",
          "Kept: your email and the record that the account was canceled, to prevent fraud and allow a defense in any disputes, plus reports and security records for as long as the law requires.",
          "Recommendations and reviews you made on other people's profiles remain visible, because they are part of those professionals' reputation. You can ask for them to be removed through the contact email.",
        ] },
      ],
    },
    {
      id: "seguranca",
      title: "Security",
      blocks: [
        { type: "p", text: "We use technical measures to protect data, such as encrypted connections, access rules that limit who can read and change each piece of information, and activity logs. No system is completely immune to failures; if an incident could put data subjects at risk, we will notify those affected and Brazil's National Data Protection Authority (ANPD), as the LGPD requires." },
      ],
    },
    {
      id: "direitos",
      title: "Your rights",
      blocks: [
        { type: "list", items: [
          "Confirm whether we process your data and access it.",
          "Correct incomplete, inaccurate or outdated data. You can correct most of it yourself in Edit profile.",
          "Ask for anonymization, blocking or deletion of data that is unnecessary or processed in breach of the LGPD.",
          "Ask for the portability of your data.",
          "Know who your data is shared with.",
          "Withdraw the consent given for religious affiliation data by deleting it in Edit profile.",
          "Ask for your data to be deleted and cancel your account in your profile settings.",
        ] },
        { type: "p", text: `Requests can be sent to ${CONTACT_EMAIL}. We reply within ${PRIVACY_REPLY_DAYS} days. You can also file a complaint with the ANPD.` },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and browser storage",
      blocks: [
        { type: "list", items: [
          "Essential: keep you signed in and protect your account. Without them, the platform doesn't work.",
          "Preferences: remember choices such as light or dark theme. They're only saved after you choose in the cookie notice, and declining them doesn't stop you from using the platform.",
          "Skillsy doesn't use advertising cookies or third-party analytics tools. If that changes, this policy will be updated and your consent will be asked for first.",
        ] },
      ],
    },
    {
      id: "menores",
      title: "Minors",
      blocks: [
        { type: "p", text: `Only people ${MINIMUM_AGE} or older can sign up for Skillsy, and the platform doesn't knowingly collect data from minors. Browsing the site doesn't require an account. If we identify an account belonging to a minor, it will be removed.` },
      ],
    },
    {
      id: "alteracoes",
      title: "Changes to this policy",
      blocks: [
        { type: "p", text: `Significant changes are announced on the platform at least ${TERMS_CHANGE_NOTICE_DAYS} days in advance and, when necessary, you'll be asked to accept again. The latest version is always on this page.` },
      ],
    },
  ],
};
