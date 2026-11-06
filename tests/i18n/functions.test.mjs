// Who gets an alert and in which language (functions/origin.js).
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, test } from "node:test";

const require = createRequire(import.meta.url);
const { categoryLabel, message, sameOrigin, contentLanguage } = require("../../functions/origin.js");

describe("avisos das Functions", () => {
  test("hoje (sem campos) todo mundo continua recebendo tudo", () => {
    assert.equal(sameOrigin({}, {}), true);
  });

  test("vaga dos EUA em inglês não avisa o Brasil", () => {
    const usJob = { language: "en", country: "US" };
    assert.equal(sameOrigin({}, usJob), false);
    assert.equal(sameOrigin({ preferredLanguage: "en" }, usJob), false);
    assert.equal(sameOrigin({ preferredLanguage: "en", country: "US" }, usJob), true);
  });

  test("mesmo país, idioma de preferência diferente: não avisa", () => {
    assert.equal(sameOrigin({ preferredLanguage: "es" }, { language: "pt" }), false);
  });

  test("texto no idioma do conteúdo, com a categoria traduzida", () => {
    const opportunity = { language: "en", category: "Construção Civil" };
    const language = contentLanguage(opportunity);
    assert.equal(
      message(language, "opportunityMatchTitle", { category: categoryLabel(language, opportunity.category) }),
      "New opportunity in Construction",
    );
    assert.equal(message("pt", "opportunityMatchTitle", { category: categoryLabel("pt", "Limpeza") }), "Nova oportunidade em Limpeza");
    assert.equal(message("pt", "jobPublished"), "Nova vaga publicada");
  });

  test("português igual ao texto de antes", () => {
    assert.equal(
      message("pt", "followUpMessage", { days: 20, title: "Pintura" }),
      "Já se passaram 20 dias desde “Pintura”. Conte se recebeu resposta e encerre a oportunidade se não precisar mais dela.",
    );
    assert.equal(
      message("pt", "opportunityMatchMessage", { title: "T", neighborhood: "Centro", city: "Rio", state: "RJ" }),
      "T — Centro, Rio (RJ)",
    );
  });
});
