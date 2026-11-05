// npm run i18n:export-legal [arquivo.csv] — Terms of Use and Privacy Policy
// side by side for the reviewers: one row per text (title, paragraph, list
// item, table cell), columns documento, trecho, pt, en, es. The documents are
// TypeScript data in lib/legal; they are copied to a temporary folder with the
// @skillsy/shared alias resolved, so plain Node can read them.
import { mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../../", import.meta.url);
const out = process.argv[2] ?? "termos-privacidade-revisao.csv";
const dir = mkdtempSync(join(tmpdir(), "legal-"));

try {
  copyFileSync(new URL("packages/shared/src/terms.ts", root), join(dir, "shared-terms.ts"));
  const load = async (name) => {
    const source = readFileSync(new URL(`lib/legal/${name}.ts`, root), "utf8")
      .replace(/from "@skillsy\/shared\/terms"/, 'from "./shared-terms.ts"')
      .replace(/^import type .*$/m, "");
    writeFileSync(join(dir, `${name}.ts`), source);
    return import(join(dir, `${name}.ts`));
  };

  // Every text of a document, in reading order, with a label for its place.
  function texts(doc) {
    const rows = [["título", doc.title], ...doc.intro.map((text, i) => [`introdução ${i + 1}`, text])];
    rows.push(["resumo: título", doc.summary.title], ...doc.summary.items.map((text, i) => [`resumo ${i + 1}`, text]));
    doc.sections.forEach((section, s) => {
      const where = `${s + 1}. ${section.id}`;
      rows.push([`${where}: título`, section.title]);
      section.blocks.forEach((block, b) => {
        const at = `${where}, bloco ${b + 1}`;
        if (block.type === "p") rows.push([at, block.text]);
        if (block.type === "list") block.items.forEach((text, i) => rows.push([`${at}, item ${i + 1}`, text]));
        if (block.type === "callout") {
          if (block.title) rows.push([`${at}: título do destaque`, block.title]);
          block.items.forEach((text, i) => rows.push([`${at}, item ${i + 1}`, text]));
        }
        if (block.type === "table") {
          block.head.forEach((text, i) => rows.push([`${at}, cabeçalho ${i + 1}`, text]));
          block.rows.forEach((row, r) => row.forEach((text, c) => rows.push([`${at}, linha ${r + 1}, coluna ${c + 1}`, text])));
        }
      });
    });
    return rows;
  }

  const cell = (value = "") => `"${String(value).replaceAll('"', '""')}"`;
  const lines = [["documento", "trecho", "pt", "en", "es"].map(cell).join(",")];
  for (const [label, name, en, es] of [
    ["Termos de Uso", "terms", "TERMS_EN", "TERMS_ES"],
    ["Política de Privacidade", "privacy", "PRIVACY_EN", "PRIVACY_ES"],
  ]) {
    const pt = texts(Object.values(await load(name))[0]);
    const enRows = texts((await load(`${name}.en`))[en]);
    const esRows = texts((await load(`${name}.es`))[es]);
    pt.forEach(([where, text], i) => lines.push([label, where, text, enRows[i]?.[1], esRows[i]?.[1]].map(cell).join(",")));
  }
  // BOM so Excel opens the accents correctly.
  writeFileSync(out, `﻿${lines.join("\n")}\n`);
  console.log(`${lines.length - 1} trechos exportados para ${out}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
