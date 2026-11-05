// Unit tests for packages/shared/src/i18n (npm run test:i18n). The modules are
// TypeScript without runtime imports, so Node runs them with type stripping.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

import { translate, messageKeys, baseKey } from "../../packages/shared/src/i18n/translate.ts";
import { formatDate, formatRating, formatRelative, toDate } from "../../packages/shared/src/i18n/format.ts";
import { enabledLocales, isLocale } from "../../packages/shared/src/i18n/locales.ts";

const read = (locale) =>
  JSON.parse(readFileSync(new URL(`../../packages/shared/src/i18n/${locale}.json`, import.meta.url), "utf8"));
const pt = read("pt");
const en = read("en");
const es = read("es");

describe("translate", () => {
  test("busca por área.chave", () => {
    assert.equal(translate(pt, "pt-BR", "nav.home"), "Inicial");
    assert.equal(translate(en, "en-US", "nav.home"), "Home");
    assert.equal(translate(es, "es-419", "nav.newsAndJobs"), "Novedades y empleos");
  });

  test("plural pelo idioma", () => {
    assert.equal(translate(pt, "pt-BR", "common.recommendations", { count: 1 }), "1 indicação");
    assert.equal(translate(pt, "pt-BR", "common.recommendations", { count: 3 }), "3 indicações");
    assert.equal(translate(pt, "pt-BR", "common.recommendations", { count: 0 }), "0 indicações");
    assert.equal(translate(en, "en-US", "common.reviews", { count: 1 }), "1 review");
    assert.equal(translate(en, "en-US", "common.reviews", { count: 2 }), "2 reviews");
    assert.equal(translate(es, "es-419", "common.reviews", { count: 1 }), "1 reseña");
  });

  test("variáveis e chave ausente", () => {
    const messages = { a: { hello: "Olá, {name}!" } };
    assert.equal(translate(messages, "pt-BR", "a.hello", { name: "Ana" }), "Olá, Ana!");
    assert.equal(translate(messages, "pt-BR", "a.hello"), "Olá, {name}!");
    assert.equal(translate(messages, "pt-BR", "a.nao.existe"), "a.nao.existe");
  });

  test("chaves e plural", () => {
    assert.ok(messageKeys(pt).includes("common.reviews_one"));
    assert.equal(baseKey("common.reviews_other"), "common.reviews");
    assert.equal(baseKey("nav.home"), "nav.home");
  });
});

describe("format", () => {
  const date = new Date("2026-11-05T15:00:00Z");

  test("nota com uma casa no padrão de cada idioma", () => {
    assert.equal(formatRating(4.5, "pt-BR"), "4,5");
    assert.equal(formatRating(4.5, "en-US"), "4.5");
    assert.equal(formatRating(undefined, "pt-BR"), "0,0");
  });

  test("datas", () => {
    assert.match(formatDate(date, "pt-BR"), /5 de nov\.? de 2026/);
    assert.match(formatDate(date, "en-US"), /Nov 5, 2026/);
    assert.equal(formatDate(null, "pt-BR"), "");
    assert.equal(toDate({ seconds: 1_793_890_800 }).getTime(), 1_793_890_800_000);
  });

  test("tempo relativo", () => {
    const now = date.getTime();
    assert.equal(formatRelative(now - 3 * 86_400_000, "pt-BR", now), "há 3 dias");
    assert.equal(formatRelative(now - 3 * 86_400_000, "en-US", now), "3 days ago");
  });
});

describe("locales", () => {
  test("português sempre ligado; desconhecidos ignorados", () => {
    assert.deepEqual(enabledLocales(undefined), ["pt"]);
    assert.deepEqual(enabledLocales("pt,en,es"), ["pt", "en", "es"]);
    assert.deepEqual(enabledLocales("en, fr"), ["pt", "en"]);
    assert.ok(isLocale("es"));
    assert.ok(!isLocale("es-419"));
  });
});

describe("scripts", () => {
  test("dicionários completos (i18n:check)", () => {
    execFileSync("node", ["scripts/i18n/check.mjs"], { stdio: "pipe" });
  });

  test("planilha de revisão vai e volta sem perder nada", () => {
    const dir = mkdtempSync(join(tmpdir(), "i18n-"));
    const csv = join(dir, "revisao.csv");
    const before = { en: readFileSync("packages/shared/src/i18n/en.json", "utf8"), es: readFileSync("packages/shared/src/i18n/es.json", "utf8") };
    try {
      execFileSync("node", ["scripts/i18n/export.mjs", csv], { stdio: "pipe" });
      writeFileSync(csv, readFileSync(csv, "utf8").replace('"Home"', '"Start"'));
      execFileSync("node", ["scripts/i18n/import.mjs", csv], { stdio: "pipe" });
      assert.equal(JSON.parse(readFileSync("packages/shared/src/i18n/en.json", "utf8")).nav.home, "Start");
      assert.equal(readFileSync("packages/shared/src/i18n/es.json", "utf8"), before.es);
    } finally {
      writeFileSync("packages/shared/src/i18n/en.json", before.en);
      writeFileSync("packages/shared/src/i18n/es.json", before.es);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
