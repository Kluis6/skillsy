// Query words in English and Spanish → Portuguese, so searches on /en and /es
// find profiles written in Portuguese ("electrician" → "eletricista"). Applied
// to the query only: profiles keep their search tokens, nothing is reindexed.
import type { Locale } from "./locales";
import { CATEGORY_LABEL_KEYS } from "./labels";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Common service words people type, beyond the category names. */
const SERVICE_WORDS: Record<"en" | "es", Record<string, string>> = {
  en: {
    electrician: "eletricista", electrical: "eletrica", plumber: "encanador", plumbing: "encanamento",
    painter: "pintor", painting: "pintura", carpenter: "marceneiro", joiner: "marceneiro",
    cleaner: "limpeza", housekeeper: "diarista", maid: "diarista", nanny: "baba", babysitter: "baba",
    lawyer: "advogado", attorney: "advogado", accountant: "contador", teacher: "professor", tutor: "professor",
    english: "ingles", spanish: "espanhol", mechanic: "mecanico", driver: "motorista", cook: "cozinheiro",
    chef: "cozinheiro", baker: "confeiteiro", cake: "bolo", cakes: "bolo", photographer: "fotografo",
    developer: "desenvolvedor", programmer: "programador", hairdresser: "cabeleireiro", hair: "cabelo",
    barber: "barbeiro", makeup: "maquiagem", gardener: "jardineiro", gardening: "jardinagem",
    mason: "pedreiro", bricklayer: "pedreiro", builder: "pedreiro", welder: "soldador", locksmith: "chaveiro",
    seamstress: "costureira", tailor: "costureira", sewing: "costura", doctor: "medico", nurse: "enfermeiro",
    dentist: "dentista", psychologist: "psicologo", physiotherapist: "fisioterapeuta",
    nutritionist: "nutricionista", trainer: "personal", musician: "musico", singer: "cantor",
    translator: "tradutor", moving: "mudanca", movers: "mudanca", delivery: "entrega", repair: "conserto",
    repairs: "conserto", installer: "instalador", installation: "instalacao", engineer: "engenheiro",
    architect: "arquiteto", consultant: "consultor", seller: "vendedor",
  },
  es: {
    electricista: "eletricista", plomero: "encanador", fontanero: "encanador", plomeria: "encanamento",
    pintor: "pintor", pintura: "pintura", carpintero: "marceneiro", carpinteria: "marcenaria",
    limpieza: "limpeza", empleada: "diarista", ninera: "baba", abogado: "advogado", contador: "contador",
    profesor: "professor", maestro: "professor", ingles: "ingles", espanol: "espanhol", mecanico: "mecanico",
    chofer: "motorista", conductor: "motorista", cocinero: "cozinheiro", pastelero: "confeiteiro",
    pastel: "bolo", pasteles: "bolo", fotografo: "fotografo", disenador: "designer",
    desarrollador: "desenvolvedor", programador: "programador", peluquero: "cabeleireiro",
    peluqueria: "cabeleireiro", barbero: "barbeiro", maquillaje: "maquiagem", jardinero: "jardineiro",
    jardineria: "jardinagem", albanil: "pedreiro", soldador: "soldador", cerrajero: "chaveiro",
    costurera: "costureira", costura: "costura", medico: "medico", enfermero: "enfermeiro",
    dentista: "dentista", psicologo: "psicologo", fisioterapeuta: "fisioterapeuta",
    nutricionista: "nutricionista", entrenador: "personal", musico: "musico", cantante: "cantor",
    traductor: "tradutor", mudanza: "mudanca", entrega: "entrega", reparacion: "conserto",
    arreglo: "conserto", instalador: "instalador", instalacion: "instalacao", ingeniero: "engenheiro",
    arquitecto: "arquiteto", consultor: "consultor", vendedor: "vendedor",
  },
};

/** Words in category labels that don't identify the category. */
const GENERIC_WORDS = new Set(["services", "service", "servicio", "servicios", "support", "care", "cuidado", "and", "del"]);

/**
 * Synonyms for the page's language; empty for Portuguese. `categoryLabel`
 * gives the label of a saved category in that language (from the dictionary
 * on the server, from useLabels on the client), so the client doesn't load
 * every dictionary.
 */
export function buildSearchSynonyms(
  locale: Locale,
  categoryLabel: (category: string) => string,
): Record<string, string> {
  if (locale === "pt") return {};
  const synonyms: Record<string, string> = {};
  for (const category of Object.keys(CATEGORY_LABEL_KEYS)) {
    for (const word of normalize(categoryLabel(category)).split(/[^a-z0-9]+/)) {
      if (word.length >= 3 && !GENERIC_WORDS.has(word)) synonyms[word] = normalize(category);
    }
  }
  return Object.assign(synonyms, SERVICE_WORDS[locale]);
}
