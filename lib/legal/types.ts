// Content of the legal pages (/termos, /privacidade), kept apart from the
// layout so both pages look the same and the text can be translated later.

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  /** Highlighted box for what the reader must not miss. */
  | { type: "callout"; tone: "info" | "warning"; title?: string; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocumentContent = {
  title: string;
  intro: string[];
  /** Short list shown first, before the index. */
  summary: { title: string; items: string[] };
  sections: LegalSection[];
  updatedAt: string;
};
