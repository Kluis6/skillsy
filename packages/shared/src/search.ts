// Search tokens stored in public_profiles.searchTokens and the stems used to
// query them. The site and the app must build them the same way.

export const MAX_SEARCH_TOKENS = 400;

/** Every word plus its prefixes of 3+ characters, in the order given: pass
 * the most important fields first, since the list is capped. */
export function toSearchTokens(...values: Array<unknown>) {
  const words = values
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(/[^a-z0-9]+/),
    )
    .filter((word) => word.length >= 2);

  const tokens = new Set<string>();
  for (const word of words) {
    tokens.add(word);
    for (let length = 3; length < word.length; length += 1)
      tokens.add(word.slice(0, length));
  }
  return [...tokens].slice(0, MAX_SEARCH_TOKENS);
}

/** One stem per query word, short enough to catch Portuguese inflections:
 * "pintor" finds "pintura", "marceneiro" finds "marcenaria". Safe to query
 * because searchTokens stores every prefix of 3+ characters. */
export function toSearchStems(value: string) {
  const words = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

  return [
    ...new Set(
      words.map((word) => word.slice(0, Math.max(4, word.length - 4))),
    ),
  ];
}

/**
 * Like toSearchStems, but each query word becomes a group of alternatives:
 * its own stem plus the stems of its Portuguese equivalent from `synonyms`
 * (normalized word → Portuguese word), so "electrician" also finds
 * "eletricista". A profile matches a group when it has any of its stems.
 * Without synonyms every group has one stem, the same as toSearchStems.
 */
export function toSearchStemGroups(value: string, synonyms: Record<string, string> = {}) {
  const words = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

  const groups: string[][] = [];
  const seen = new Set<string>();
  for (const word of words) {
    const own = toSearchStems(word)[0];
    if (!own || seen.has(own)) continue;
    seen.add(own);
    const translated = synonyms[word] ? toSearchStems(synonyms[word]) : [];
    groups.push([...new Set([own, ...translated])]);
  }
  return groups;
}
