// The translated legal documents (lib/legal/*.en.ts, *.es.ts) must keep the
// structure of the Portuguese ones: same sections, in the same order, with the
// same ids (other pages link to them) and the same kinds of blocks, lists and
// table rows. Read as text: the files import @skillsy/shared aliases that
// plain Node can't resolve.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const read = (name) => readFileSync(new URL(`../../lib/legal/${name}.ts`, import.meta.url), "utf8");

function shape(source) {
  return {
    ids: [...source.matchAll(/^\s+id: "([^"]+)"/gm)].map((m) => m[1]),
    blocks: [...source.matchAll(/\{ type: "(\w+)"(?:, tone: "(\w+)")?/g)].map((m) => m.slice(1).filter(Boolean).join(":")),
    tableRows: (source.match(/^\s+\[".*\],?$/gm) ?? []).length,
    summaryItems: (source.slice(source.indexOf("summary:"), source.indexOf("sections:")).match(/^\s+[`"].*[`"],$/gm) ?? []).length,
  };
}

for (const doc of ["terms", "privacy"]) {
  describe(`${doc}: traduções com a mesma estrutura do português`, () => {
    const pt = shape(read(doc));
    for (const locale of ["en", "es"]) {
      test(locale, () => {
        const translated = shape(read(`${doc}.${locale}`));
        assert.deepEqual(translated.ids, pt.ids, "seções e ids");
        assert.deepEqual(translated.blocks, pt.blocks, "tipos de bloco");
        assert.equal(translated.tableRows, pt.tableRows, "linhas de tabela");
        assert.equal(translated.summaryItems, pt.summaryItems, "itens do resumo");
      });
    }
  });
}
