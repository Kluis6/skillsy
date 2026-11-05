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
