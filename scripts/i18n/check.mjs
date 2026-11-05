// npm run i18n:check — every language has the messages of pt.json (the source
// of truth), no extra ones, the same {variables}, and an "_other" form for
// every plural. Runs in CI; exits with 1 on any problem.
import { LOCALES, baseKey, flatten, isPlural, readDictionary, varsOf } from "./dictionaries.mjs";

const flat = Object.fromEntries(LOCALES.map((locale) => [locale, flatten(readDictionary(locale))]));
const problems = [];

// Messages are compared by base key: plural forms differ between languages.
const messages = (locale) => {
  const groups = {};
  for (const [path, text] of Object.entries(flat[locale])) (groups[baseKey(path)] ??= []).push([path, text]);
  return groups;
};
const source = messages("pt");

for (const locale of LOCALES.filter((locale) => locale !== "pt")) {
  const target = messages(locale);
  for (const [key, forms] of Object.entries(source)) {
    if (!target[key]) {
      problems.push(`${locale}: falta "${key}"`);
      continue;
    }
    const expected = varsOf(forms.map(([, text]) => text).join(" "));
    const found = varsOf(target[key].map(([, text]) => text).join(" "));
    if (expected !== found) problems.push(`${locale}: "${key}" usa {${found}} e o pt usa {${expected}}`);
    if (forms.some(([path]) => isPlural(path)) && !target[key].some(([path]) => path.endsWith("_other"))) {
      problems.push(`${locale}: "${key}" é plural e não tem a forma _other`);
    }
  }
  for (const key of Object.keys(target)) {
    if (!source[key]) problems.push(`${locale}: "${key}" não existe no pt.json`);
  }
}

if (problems.length) {
  console.error(`i18n: ${problems.length} problema(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`i18n: ${Object.keys(source).length} mensagens, ${LOCALES.join("/")} completos.`);
