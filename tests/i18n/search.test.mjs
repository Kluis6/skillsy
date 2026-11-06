// Query words in other languages also look for the Portuguese word.
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { toSearchStemGroups, toSearchStems, toSearchTokens } from "../../packages/shared/src/search.ts";
import { CATEGORY_LABEL_KEYS, DAY_LABEL_KEYS } from "../../packages/shared/src/i18n/labels.ts";
import { readFileSync } from "node:fs";

const dict = (locale) =>
  JSON.parse(readFileSync(new URL(`../../packages/shared/src/i18n/${locale}.json`, import.meta.url), "utf8"));

describe("busca", () => {
  test("sem sinônimos, igual a toSearchStems (português e app)", () => {
    for (const query of ["eletricista", "Pintor de paredes", "bolo de pote", "ab"]) {
      assert.deepEqual(toSearchStemGroups(query).flat(), toSearchStems(query));
    }
  });

  test("palavra em inglês também procura a portuguesa", () => {
    const groups = toSearchStemGroups("Electrician", { electrician: "eletricista" });
    assert.deepEqual(groups, [["electri", "eletric"]]);
    // A profile with "Eletricista" matches the second stem.
    assert.ok(toSearchTokens("Eletricista").includes(groups[0][1]));
  });

  test("palavras sem tradução continuam sozinhas", () => {
    const groups = toSearchStemGroups("plumber Rio", { plumber: "encanador" });
    assert.deepEqual(groups, [
      [toSearchStems("plumber")[0], toSearchStems("encanador")[0]],
      [toSearchStems("Rio")[0]],
    ]);
  });
});

describe("rótulos", () => {
  test("toda categoria e dia têm rótulo nos três idiomas", () => {
    for (const locale of ["pt", "en", "es"]) {
      const labels = dict(locale).labels;
      for (const key of Object.values(CATEGORY_LABEL_KEYS)) assert.ok(labels.category[key], `${locale}: categoria ${key}`);
      for (const key of Object.values(DAY_LABEL_KEYS)) assert.ok(labels.day[key], `${locale}: dia ${key}`);
    }
  });

  test("rótulo em português é o próprio valor gravado", () => {
    const labels = dict("pt").labels;
    for (const [value, key] of Object.entries(CATEGORY_LABEL_KEYS)) assert.equal(labels.category[key], value);
    for (const [value, key] of Object.entries(DAY_LABEL_KEYS)) assert.equal(labels.day[key], value);
  });

  test("todas as categorias e dias do cadastro têm chave", () => {
    const options = readFileSync(new URL("../../packages/shared/src/profile-options.ts", import.meta.url), "utf8");
    const list = (name) => [...options.slice(options.indexOf(name)).split("]")[0].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.deepEqual(list("PROVIDER_CATEGORIES").filter((c) => !CATEGORY_LABEL_KEYS[c]), []);
    assert.deepEqual(list("AVAILABILITY_OPTIONS").filter((d) => !DAY_LABEL_KEYS[d]), []);
  });
});

describe("origem do conteúdo", async () => {
  const { byOrigin } = await import("../../packages/shared/src/i18n/origin.ts");
  const items = [
    { id: 1 },
    { id: 2, language: "en" },
    { id: 3, language: "pt", country: "BR" },
    { id: 4, language: "en", country: "US" },
    { id: 5, language: "es" },
  ];

  test("português: só Brasil, ordem mantida (sem campos = pt/BR)", () => {
    assert.deepEqual(byOrigin(items, { language: "pt" }).map((i) => i.id), [1, 3, 2, 5]);
  });

  test("inglês: conteúdo em inglês primeiro, o resto depois, sem o dos EUA", () => {
    assert.deepEqual(byOrigin(items, { language: "en" }).map((i) => i.id), [2, 1, 3, 5]);
  });

  test("outro país só vê o próprio conteúdo", () => {
    assert.deepEqual(byOrigin(items, { language: "en", country: "US" }).map((i) => i.id), [4]);
  });
});

describe("plano da consulta", async () => {
  // providers.ts imports "./search" without an extension: load a copy that Node can run.
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "providers-"));
  const src = (name) => readFileSync(new URL(`../../packages/shared/src/${name}.ts`, import.meta.url), "utf8");
  writeFileSync(join(dir, "search.ts"), src("search"));
  writeFileSync(join(dir, "providers.ts"), src("providers").replace('from "./search"', 'from "./search.ts"'));
  const { planProviderSearch } = await import(join(dir, "providers.ts"));
  rmSync(dir, { recursive: true, force: true });

  test("sem sinônimos, plano igual ao de antes", () => {
    const plan = planProviderSearch("marceneiro rio", { city: "Niterói" });
    assert.deepEqual(plan.terms, toSearchStems("marceneiro rio"));
    assert.equal(plan.termGroups, undefined);
    assert.equal(plan.anchorAny, undefined);
  });

  test("âncora no termo mais longo, mesmo quando ele tem alternativas", () => {
    const plan = planProviderSearch("carpenter rio", undefined, undefined, { carpenter: "marceneiro" });
    assert.equal(plan.anchor, undefined);
    assert.deepEqual(plan.anchorAny, [toSearchStems("carpenter")[0], toSearchStems("marceneiro")[0]]);
  });

  test("palavra sem alternativa mais longa vira a âncora simples", () => {
    const plan = planProviderSearch("cake confeitaria", undefined, undefined, { cake: "bolo" });
    assert.equal(plan.anchor, toSearchStems("confeitaria")[0]);
    assert.equal(plan.anchorAny, undefined);
  });
});
