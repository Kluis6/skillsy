// npm run i18n:import arquivo.csv — brings the reviewed spreadsheet back:
// updates en.json and es.json (pt.json stays the source of truth and is only
// changed in the code). Run npm run i18n:check afterwards.
import { readFileSync } from "node:fs";
import { baseKey, flatten, readDictionary, unflatten, writeDictionary } from "./dictionaries.mjs";

const file = process.argv[2];
if (!file) {
  console.error("Uso: npm run i18n:import -- arquivo.csv");
  process.exit(1);
}

// Minimal CSV reader: quoted cells, "" escapes, commas and line breaks inside quotes.
function parseCsv(text) {
  const rows = [[]];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { rows.at(-1).push(cell); cell = ""; }
    else if (char === "\n") { rows.at(-1).push(cell.replace(/\r$/, "")); rows.push([]); cell = ""; }
    else cell += char;
  }
  if (cell || rows.at(-1).length) rows.at(-1).push(cell);
  return rows.filter((row) => row.length > 1);
}

const [header, ...rows] = parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""));
const column = Object.fromEntries(header.map((name, index) => [name.trim(), index]));
const order = [...new Set(Object.keys(flatten(readDictionary("pt"))).map(baseKey))];

for (const locale of ["en", "es"]) {
  const current = flatten(readDictionary(locale));
  let changed = 0;
  for (const row of rows) {
    const key = row[column.chave];
    const value = row[column[locale]]?.trim();
    if (key && value && current[key] !== value) { current[key] = value; changed += 1; }
  }
  // Keep pt.json's order; messages pt no longer has are dropped. Compared by
  // base key, so plural forms only one language needs (e.g. _many) stay.
  const ordered = Object.fromEntries(
    order.flatMap((base) => Object.entries(current).filter(([key]) => baseKey(key) === base)),
  );
  writeDictionary(locale, unflatten(ordered));
  console.log(`${locale}: ${changed} mensagem(ns) atualizada(s)`);
}
