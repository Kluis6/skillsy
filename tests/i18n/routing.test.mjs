// Locale routing rules used by proxy.ts (npm run test:i18n).
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { localizedPath, matchLocale, parseAcceptLanguage, resolveLocaleRoute } from "../../packages/shared/src/i18n/routing.ts";

const supported = ["pt", "en", "es"];
const route = (pathname, { enabled = supported, cookie, acceptLanguage } = {}) =>
  resolveLocaleRoute({ pathname, cookie, acceptLanguage, enabled, supported, defaultLocale: "pt" });

describe("só português ligado (produção hoje)", () => {
  const ptOnly = { enabled: ["pt"] };

  test("URLs de hoje continuam iguais", () => {
    assert.deepEqual(route("/", ptOnly), { action: "rewrite", pathname: "/pt" });
    assert.deepEqual(route("/profile/abc", ptOnly), { action: "rewrite", pathname: "/pt/profile/abc" });
  });

  test("navegador em inglês continua no português", () => {
    assert.deepEqual(route("/termos", { ...ptOnly, acceptLanguage: "en-US,en;q=0.9", cookie: "en" }), {
      action: "rewrite",
      pathname: "/pt/termos",
    });
  });

  test("/en e /es dão 404 enquanto desligados", () => {
    assert.deepEqual(route("/en", ptOnly), { action: "notFound" });
    assert.deepEqual(route("/es/termos", ptOnly), { action: "notFound" });
  });
});

describe("três idiomas ligados", () => {
  test("/pt/x volta para /x", () => {
    assert.deepEqual(route("/pt/termos"), { action: "redirect", pathname: "/termos", status: 308 });
    assert.deepEqual(route("/pt"), { action: "redirect", pathname: "/", status: 308 });
  });

  test("imagens de compartilhamento em /pt não redirecionam", () => {
    assert.deepEqual(route("/pt/profile/abc/opengraph-image-1x2y3z"), { action: "next" });
  });

  test("/en/x e /es/x são servidos", () => {
    assert.deepEqual(route("/en/termos"), { action: "next" });
    assert.deepEqual(route("/es"), { action: "next" });
  });

  test("escolha salva vem antes do navegador", () => {
    assert.deepEqual(route("/termos", { cookie: "es", acceptLanguage: "en" }), {
      action: "redirect",
      pathname: "/es/termos",
      status: 307,
    });
    assert.deepEqual(route("/termos", { cookie: "pt", acceptLanguage: "en" }), { action: "rewrite", pathname: "/pt/termos" });
  });

  test("navegador decide sem escolha salva; espanhol de qualquer país vai para es", () => {
    assert.deepEqual(route("/", { acceptLanguage: "es-MX,es;q=0.9" }), { action: "redirect", pathname: "/es", status: 307 });
    assert.deepEqual(route("/", { acceptLanguage: "fr-FR,de;q=0.8" }), { action: "rewrite", pathname: "/pt" });
    assert.deepEqual(route("/", {}), { action: "rewrite", pathname: "/pt" });
  });

  test("palavras que só começam com um idioma não contam", () => {
    assert.deepEqual(route("/english"), { action: "rewrite", pathname: "/pt/english" });
  });
});

describe("Accept-Language", () => {
  test("ordem por q e pela posição", () => {
    assert.deepEqual(parseAcceptLanguage("en;q=0.5, es-AR, *;q=0.1, fr;q=0"), ["es-ar", "en"]);
    assert.deepEqual(parseAcceptLanguage(null), []);
  });

  test("primeiro idioma ligado aceito", () => {
    assert.equal(matchLocale("de-DE,en-GB;q=0.8,es;q=0.7", ["pt", "en", "es"], "pt"), "en");
    assert.equal(matchLocale("en-GB", ["pt"], "pt"), "pt");
  });
});

describe("localizedPath", () => {
  test("prefixo só fora do português", () => {
    assert.equal(localizedPath("/profile/1", "pt", "pt"), "/profile/1");
    assert.equal(localizedPath("/profile/1", "en", "pt"), "/en/profile/1");
    assert.equal(localizedPath("/", "es", "pt"), "/es");
    assert.equal(localizedPath("https://wa.me/55", "en", "pt"), "https://wa.me/55");
    assert.equal(localizedPath("#topo", "en", "pt"), "#topo");
  });
});
