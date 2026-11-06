// npm run i18n:functions — writes functions/i18n.json from the dictionaries:
// the texts of the notifications the Functions create ("functions" area) and
// the category labels, per language. The Functions are deployed on their own
// and can't import packages/shared; `i18n:check` fails when this file is
// out of date. `--check` only compares.
import { readFileSync, writeFileSync } from "node:fs";
import { LOCALES, readDictionary } from "./dictionaries.mjs";

const labelsSource = readFileSync(new URL("../../packages/shared/src/i18n/labels.ts", import.meta.url), "utf8");
const block = labelsSource.slice(labelsSource.indexOf("CATEGORY_LABEL_KEYS"), labelsSource.indexOf("};"));
// Category saved in Portuguese → label key ("Construção Civil" → "construction").
const categoryKeys = Object.fromEntries(
  [...block.matchAll(/^\s+(?:"([^"]+)"|([^\s:"]+)):\s*"([^"]+)",/gm)].map((m) => [m[1] ?? m[2], m[3]]),
);

const data = Object.fromEntries(
  LOCALES.map((locale) => {
    const dictionary = readDictionary(locale);
    const categories = Object.fromEntries(
      Object.entries(categoryKeys).map(([value, key]) => [value, dictionary.labels.category[key]]),
    );
    return [locale, { messages: dictionary.functions, categories }];
  }),
);
const content = `${JSON.stringify(data, null, 2)}\n`;
const target = new URL("../../functions/i18n.json", import.meta.url);

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {
    // Missing counts as out of date.
  }
  if (current !== content) {
    console.error("functions/i18n.json desatualizado: rode npm run i18n:functions");
    process.exit(1);
  }
  console.log("functions/i18n.json em dia.");
} else {
  writeFileSync(target, content);
  console.log(`functions/i18n.json: ${Object.keys(categoryKeys).length} categorias, ${LOCALES.join("/")}`);
}
