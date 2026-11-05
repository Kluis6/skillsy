// Types of the message keys, taken from pt.json (the source of truth): a key
// that doesn't exist fails the type check instead of showing up on screen.
import type pt from "./pt.json";

type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other";
type WithoutPlural<K> = K extends `${infer Base}_${PluralForm}` ? Base : K;

/** "common.save", "nav.home", "common.reviews" (plural, used with { count }). */
export type MessageKey = WithoutPlural<Paths<typeof pt>>;

/** Top-level areas of the dictionary ("common", "nav", "home"…). */
export type MessageArea = keyof typeof pt;

export type TranslateFn = (key: MessageKey, vars?: Record<string, string | number>) => string;
