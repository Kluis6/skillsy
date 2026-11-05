// t(): looks up "area.key" in a dictionary, fills {variables} and picks the
// plural form. Plurals are keys ending in _one / _other (and _zero, _few,
// _many when a language needs them), chosen with Intl.PluralRules.
// No imports besides types, so tests can run it with plain Node.

export type Messages = { [key: string]: string | Messages };
export type Vars = Record<string, string | number>;

const PLURAL_SUFFIXES = ["zero", "one", "two", "few", "many", "other"] as const;

function lookup(messages: Messages, path: string): string | Messages | undefined {
  let node: string | Messages | undefined = messages;
  for (const part of path.split(".")) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return node;
}

function fill(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Translate `key`. With `vars.count`, the plural form is picked for
 * `intlLocale` ("pt-BR", "en-US", "es-419"). A missing key returns the key
 * itself, so a gap shows up on screen instead of crashing.
 */
export function translate(
  messages: Messages,
  intlLocale: string,
  key: string,
  vars?: Vars,
): string {
  if (vars && typeof vars.count === "number") {
    // CLDR puts 0 in "one" for pt-BR ("0 indicação"), but Brazilian usage is
    // plural, as in en and es: zero uses _zero when present, else _other.
    const form = vars.count === 0 ? "zero" : new Intl.PluralRules(intlLocale).select(vars.count);
    const plural = lookup(messages, `${key}_${form}`) ?? lookup(messages, `${key}_other`);
    if (typeof plural === "string") return fill(plural, vars);
  }
  const value = lookup(messages, key);
  return typeof value === "string" ? fill(value, vars) : key;
}

/** Every "area.key" path of a dictionary, plural forms included. */
export function messageKeys(messages: Messages, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([name, value]) => {
    const path = prefix ? `${prefix}.${name}` : name;
    return typeof value === "string" ? [path] : messageKeys(value, path);
  });
}

/** "indicacoes_one" → "indicacoes": plural forms belong to one message. */
export function baseKey(path: string) {
  const suffix = PLURAL_SUFFIXES.find((form) => path.endsWith(`_${form}`));
  return suffix ? path.slice(0, -(suffix.length + 1)) : path;
}

/** {variables} used in a message, sorted. */
export function messageVars(text: string) {
  return [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))].sort();
}
