// Every message in the shared zod schemas the site uses must have an entry in
// pt.json "validation", so useValidationMessage() can show it translated.
// Admin-only schemas stay Portuguese and are skipped.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../../packages/shared/src/validations.ts", import.meta.url), "utf8");
const pt = JSON.parse(readFileSync(new URL("../../packages/shared/src/i18n/pt.json", import.meta.url), "utf8"));

// Drop the admin schemas.
const siteSource = source
  .replace(/export const admin\w+Schema = z\.object\(\{[\s\S]*?\n\}\);/g, "")
  .replace(/^\s*\/\/.*$/gm, "");
// String literals that read as a sentence (messages), with ${expr} as {var}.
const messages = [...siteSource.matchAll(/(['`])([^'`\n]* [^'`\n]*)\1/g)]
  .map((match) => match[2])
  .filter((text) => /^[a-zà-ú]/i.test(text) && /[a-zà-ú]{3,}/i.test(text) && !text.includes("=>"))
  .map((text) => text.replace(/\$\{[^}]+\}/g, "{var}"));

const known = Object.values(pt.validation).map((text) => text.replace(/\{\w+\}/g, "{var}"));

test("mensagens dos esquemas do site no pt.json", () => {
  assert.ok(messages.length > 40, `poucas mensagens encontradas (${messages.length})`);
  const missing = [...new Set(messages)].filter((text) => !known.includes(text));
  assert.deepEqual(missing, [], "mensagens sem tradução em validation");
});
