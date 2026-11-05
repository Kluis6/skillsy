// npm run i18n:export [arquivo.csv] — spreadsheet for the reviewers:
// chave, pt, en, es (one row per message, plural forms included).
// Open it in Google Sheets or Excel, edit the en/es columns and bring it back
// with npm run i18n:import.
import { writeFileSync } from "node:fs";
import { LOCALES, flatten, readDictionary } from "./dictionaries.mjs";

const out = process.argv[2] ?? "i18n-revisao.csv";
const flat = Object.fromEntries(LOCALES.map((locale) => [locale, flatten(readDictionary(locale))]));
const cell = (value = "") => `"${String(value).replaceAll('"', '""')}"`;

const rows = [["chave", ...LOCALES].map(cell).join(",")];
for (const key of Object.keys(flat.pt)) {
  rows.push([key, ...LOCALES.map((locale) => flat[locale][key] ?? "")].map(cell).join(","));
}
// BOM so Excel opens the accents correctly.
writeFileSync(out, `﻿${rows.join("\n")}\n`);
console.log(`${rows.length - 1} mensagens exportadas para ${out}`);
