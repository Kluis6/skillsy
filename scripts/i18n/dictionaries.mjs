// Shared helpers for the i18n scripts: read and write the dictionaries in
// packages/shared/src/i18n and flatten them to "area.key" paths.
import { readFileSync, writeFileSync } from "node:fs";

export const LOCALES = ["pt", "en", "es"];
const DIR = new URL("../../packages/shared/src/i18n/", import.meta.url);

export const readDictionary = (locale) => JSON.parse(readFileSync(new URL(`${locale}.json`, DIR), "utf8"));
export const writeDictionary = (locale, data) =>
  writeFileSync(new URL(`${locale}.json`, DIR), `${JSON.stringify(data, null, 2)}\n`);

/** { a: { b: "x" } } → { "a.b": "x" } */
export function flatten(node, prefix = "", out = {}) {
  for (const [name, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${name}` : name;
    if (typeof value === "string") out[path] = value;
    else flatten(value, path, out);
  }
  return out;
}

/** { "a.b": "x" } → { a: { b: "x" } }, keeping the key order given. */
export function unflatten(flat) {
  const root = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = root;
    for (const part of parts.slice(0, -1)) node = node[part] ??= {};
    node[parts.at(-1)] = value;
  }
  return root;
}

const PLURAL = /_(zero|one|two|few|many|other)$/;
/** "common.reviews_one" → "common.reviews" */
export const baseKey = (path) => path.replace(PLURAL, "");
export const isPlural = (path) => PLURAL.test(path);
export const varsOf = (text) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(",");
