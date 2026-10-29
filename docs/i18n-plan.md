# Multi-idioma (pt-BR, en, es-419) — plano de implantação

Registrado em 29/10/2026. **Status: planejado, não iniciado.** Glossário para os revisores: [`i18n-glossario.md`](./i18n-glossario.md).

Objetivo: site e app em **português do Brasil (padrão), inglês e espanhol da América Latina**, usando os recursos nativos do Next.js 16 no site e os mesmos dicionários no app. Revisores nativos de inglês e espanhol já estão definidos.

> Fonte técnica: `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`, `…/04-functions/next-root-params.md` e `…/03-file-conventions/proxy.md` (Next.js 16.3). Esta versão tem mudanças em relação a versões anteriores: `middleware` virou **`proxy`**, e o idioma é lido com **`next/root-params`**. Releia esses guias antes de começar, pois podem ter mudado.

---

## 1. Escopo

### Entra

- Toda a interface do site e do app: menus, botões, formulários, mensagens de erro, estados vazios, toasts, e-mails do Firebase Auth, notificações e push.
- Rótulos de dados fixos: categorias, dias de atendimento, status de oportunidades e artigos, motivos de denúncia.
- SEO por idioma: títulos, descrições, `hreflang`, sitemap e imagens Open Graph.
- Páginas legais (`/termos`, `/privacidade`) traduzidas e revisadas.

### Não entra (decisão consciente)

- **Conteúdo dos usuários** (perfis, artigos, vagas, oportunidades, avaliações) aparece no idioma em que foi escrito. Ver dificuldade 11.
- **Uso fora do Brasil.** Estados (UF), telefone com +55, CEP e WhatsApp continuam brasileiros. A tradução atende quem fala inglês ou espanhol **no Brasil** (ou acompanha a comunidade brasileira). Abrir para outros países é um projeto separado (endereços, DDI, moedas, leis locais).
- **Painel administrativo**: continua só em português nesta etapa (público interno).
- **Notificações para admins** (`admin_notifications`): continuam em português.

---

## 2. Decisões técnicas

| Tema | Decisão |
| --- | --- |
| Idiomas | `pt` (padrão, `pt-BR` no `<html lang>`), `en` (`en`), `es` (`es-419`, América Latina) |
| Rotas | `app/[lang]/…`. **Português sem prefixo** (`/artigosevagas`), inglês e espanhol com prefixo (`/en/…`, `/es/…`) |
| Detecção | `proxy.ts`: 1) prefixo na URL; 2) cookie `lang` (escolha manual); 3) `Accept-Language` (`@formatjs/intl-localematcher` + `negotiator`); 4) `pt` |
| Português | URL sem prefixo é **reescrita** (`NextResponse.rewrite`) para `/pt/…`; `/pt/…` digitado é **redirecionado** para a versão sem prefixo (uma URL por página) |
| Textos | Dicionários JSON em `packages/shared/src/i18n/{pt,en,es}.json`, divididos por área. `pt.json` é a fonte da verdade e gera os tipos |
| Server Components | `getDictionary(area)` lê o idioma com `import { lang } from 'next/root-params'` |
| Client Components | `I18nProvider` no layout entrega só as áreas usadas pela página; hook `useT()` |
| Biblioteca | Sem biblioteca de i18n (padrão do guia do Next.js). Plurais com `Intl.PluralRules`, datas e números com `Intl` |
| Validação (zod 4) | Mensagens dos schemas viram **chaves** (`'validation.title.min'`); a tela traduz a chave |
| Dados no Firestore | Categorias e dias continuam gravados em português e funcionam como **chaves**; só o rótulo exibido é traduzido |
| Idioma da pessoa | Campo `preferredLanguage` em `users/{uid}`, usado por Functions, push e e-mails do Firebase Auth |
| Lançamento | Variável `NEXT_PUBLIC_ENABLED_LOCALES` (`pt` → `pt,en,es`); idiomas desligados respondem 404 |
| Espanhol | América Latina: tratamento por **tú** (a confirmar com os revisores), vocabulário latino-americano |

---

## 3. Arquitetura

### 3.1 Pastas

```text
packages/shared/src/i18n/
  locales.ts            LOCALES, DEFAULT_LOCALE, HTML_LANG, OG_LOCALE, isLocale()
  pt.json en.json es.json
  types.ts              Dictionary = typeof pt (chaves faltando quebram o build)
  translate.ts          t(dict, 'area.chave', { vars }) + plural com Intl.PluralRules
  labels.ts             categoria/dia/status (valor salvo → chave do dicionário)
  format.ts             formatDate, formatNumber, formatRating por idioma (Intl)
app/
  [lang]/               tudo que hoje está em app/, exceto api/, robots.ts e sitemap.ts
    layout.tsx          <html lang>, I18nProvider, generateStaticParams
    dictionaries.ts     getDictionary(area) com next/root-params
  global-not-found.tsx  404 fora de qualquer rota (precisa de experimental.globalNotFound)
  api/  robots.ts  sitemap.ts
proxy.ts
lib/i18n/
  provider.tsx          'use client': I18nProvider + useT() + useLocale()
  href.ts               localizedHref(path, locale): sem prefixo para pt
  switcher.tsx          seletor de idioma (grava cookie e navega)
scripts/i18n/
  check.mjs             mesmas chaves e mesmas variáveis {x} nos 3 arquivos
  export.mjs / import.mjs   planilha (CSV) para os revisores
```

### 3.2 `proxy.ts` (esboço)

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { DEFAULT_LOCALE, enabledLocales, isLocale } from '@skillsy/shared/i18n/locales';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1];
  const locales = enabledLocales(); // NEXT_PUBLIC_ENABLED_LOCALES

  if (first === DEFAULT_LOCALE) {
    // /pt/x → /x (uma única URL para o português)
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) {
    return locales.includes(first) ? NextResponse.next() : new NextResponse(null, { status: 404 });
  }

  // Sem prefixo: escolha salva, depois o navegador.
  const saved = request.cookies.get('lang')?.value;
  const preferred = saved && locales.includes(saved)
    ? saved
    : match(new Negotiator({ headers: { 'accept-language': request.headers.get('accept-language') ?? '' } }).languages(), locales, DEFAULT_LOCALE);

  const url = request.nextUrl.clone();
  if (preferred !== DEFAULT_LOCALE) {
    url.pathname = `/${preferred}${pathname}`;
    return NextResponse.redirect(url);
  }
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Fora: _next, api, arquivos com extensão (ícones, imagens), robots e sitemap.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
```

> `es-MX`, `es-AR`, `es-ES`… caem em `es`: o `match` faz o fallback pelo idioma base. Robôs de busca sem `Accept-Language` recebem português.

### 3.3 Dicionários no servidor e no cliente

```ts
// app/[lang]/dictionaries.ts
import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { isLocale } from '@skillsy/shared/i18n/locales';

const dictionaries = {
  pt: () => import('@skillsy/shared/i18n/pt.json').then((m) => m.default),
  en: () => import('@skillsy/shared/i18n/en.json').then((m) => m.default),
  es: () => import('@skillsy/shared/i18n/es.json').then((m) => m.default),
};

export async function getDictionary() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return dictionaries[locale]();
}
```

```tsx
// app/[lang]/layout.tsx (trecho)
import { lang } from 'next/root-params';
export async function generateStaticParams() {
  return enabledLocales().map((lang) => ({ lang }));
}
export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const locale = await lang();
  const dict = await getDictionary();
  return (
    <html lang={HTML_LANG[locale]} suppressHydrationWarning>
      <body>
        <I18nProvider locale={locale} messages={pick(dict, ['common', 'nav', 'auth'])}>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

Páginas com componentes cliente pesados envolvem o conteúdo num `I18nProvider` aninhado com as áreas extras (ex.: `opportunities`), para não mandar o dicionário inteiro ao navegador.

---

## 4. Dificuldades e soluções

| # | Dificuldade | Solução |
| --- | --- | --- |
| 1 | **Links já espalhados** (posts nas redes, notificações gravadas com `/artigosevagas/slug`, `/admin/usuarios`, compartilhamentos do app) | Português sem prefixo. URL sem prefixo continua válida e é reescrita para `pt` ou redirecionada para o idioma salvo da pessoa. Links gravados no banco ficam **sem idioma** e recebem o prefixo na hora de exibir (`localizedHref`) |
| 2 | **Mover `app/` para `app/[lang]/`** (26 páginas, grupos de rota, `error.tsx`, `not-found.tsx`, `opengraph-image.tsx`, ícones) quebra tudo de uma vez e gera conflito com trabalho paralelo | Uma etapa só para isso (E2), com `git mv` para manter o histórico, **sem mudar textos**, e congelamento de mudanças no site durante a etapa. `api/`, `robots.ts` e `sitemap.ts` ficam fora. Conferir no guia se `icon.svg`/`apple-icon.svg` precisam ir para `[lang]` |
| 3 | **404 com raiz dinâmica**: com o layout raiz em `[lang]`, URLs que não casam com nenhuma rota não têm layout | `app/global-not-found.tsx` + `experimental.globalNotFound: true` (o guia cita exatamente este caso). O `not-found.tsx` em `[lang]` continua para 404 dentro das rotas |
| 4 | **91 componentes cliente** não podem usar `next/root-params` (só Server Components) | `I18nProvider`/`useT()`. Textos que dependem só do servidor (metadados, páginas estáticas) usam `getDictionary()` |
| 5 | **Tamanho do dicionário no navegador** (~1.900 textos × 3 idiomas) | Dicionário dividido por área; cada layout ou página entrega só as áreas que usa. O servidor nunca envia os outros idiomas |
| 6 | **Navegação no cliente** (`router.push('/blocked')`, `'/admin'`, 22 `router.push/replace/redirect` e 67 `href="/…"`) perderia o idioma | `localizedHref(path)` e um `Link` próprio (`LocalizedLink`) que aplicam o prefixo do idioma atual. Regra de lint proibindo `href="/` literal fora dele |
| 7 | **Validações zod** escritas com mensagens em português em `packages/shared/src/validations.ts` (usadas pelo site e pelo app) | Mensagens viram chaves (`'validation.title.min'`); os formulários traduzem com `t()`. Mensagens padrão do zod via `z.config(z.locales.en())`/`es()` (o zod 4 já traz esses idiomas) |
| 8 | **Categorias e dias gravados em português** no Firestore e usados na busca, nos filtros, nas regras (`isValidCategory`) e em `notifyMatchingProfessionals` | Os valores continuam como chave. `labels.ts` mapeia valor → texto por idioma. Selects e filtros mostram o rótulo e gravam a chave. **Nenhuma migração de dados** |
| 9 | **Busca entre idiomas**: `searchTokens` só tem palavras em português; quem busca "electrician" não acha "Eletricista" | 1) Os tokens passam a incluir os **rótulos da categoria nos 3 idiomas**. 2) Dicionário de sinônimos de serviços (`electrician→eletric`, `plumber→encanad`, `limpieza→limpez`…) aplicado nos radicais da busca antes da consulta. 3) Script para recalcular `searchTokens` dos perfis existentes (roda o responsável, como os outros scripts de produção) |
| 10 | **Plurais e formatos** (`"1 indicação"`, nota `"4,5"`, datas com date-fns `ptBR` em 5 arquivos e 15 usos de `pt-BR`) | `Intl.PluralRules` no `t()` (`indicacoes_one`/`_other`), `Intl.NumberFormat` para notas, `Intl.DateTimeFormat`/`RelativeTimeFormat` no lugar do date-fns |
| 11 | **Conteúdo dos usuários** em português para quem lê em outro idioma | Campo opcional `language` em artigos e vagas (padrão `pt`), selo do idioma no card e, no futuro, botão "Traduzir" com Gemini no cliente (regra da plataforma). Perfis não são traduzidos |
| 12 | **Notificações e push** criadas nas Functions com texto em português | `preferredLanguage` no perfil. As Functions montam título e mensagem por destinatário com um dicionário próprio (`functions/i18n.js`). Na criação em massa (`notifyMembersOfNewPost`), agrupar destinatários por idioma |
| 13 | **E-mails do Firebase Auth** (recuperar senha) saem no idioma do console | `auth.languageCode = locale` antes de `sendPasswordResetEmail` (site e app) e modelos traduzidos no console do Firebase |
| 14 | **SEO**: conteúdo duplicado e canonical | `alternates.canonical` por idioma, `alternates.languages` (`pt-BR`, `en`, `es-419`, `x-default` = pt) em `createPublicMetadata`; sitemap com as 3 versões de cada URL; OG com `locale` e texto no idioma |
| 15 | **Textos mais longos** em inglês e espanhol (+15–30%) quebram botões, chips, abas e cards | Etapa de revisão visual em larguras de 360, 412 e 1280 px; textos de botão curtos no glossário; `numberOfLines`/`truncate` onde fizer sentido |
| 16 | **Termos da comunidade** ("ala", "estaca", "membro verificado", "Indicar", "Conectar") sem tradução óbvia | Glossário (`i18n-glossario.md`) aprovado pelos revisores **antes** de traduzir. Termos da Igreja seguem o uso oficial em cada idioma (ex.: ala → *ward* / *barrio*) |
| 17 | **Páginas legais** traduzidas podem gerar divergência jurídica | Tradução revisada e aviso "Em caso de divergência, prevalece a versão em português". Aceite (`termsVersion`) continua único |
| 18 | **Tradução feita fora do código** (revisores não programam) | `npm run i18n:export` gera uma planilha (chave, pt, en, es, contexto); `i18n:import` traz de volta. `i18n:check` no CI garante as mesmas chaves e variáveis nos 3 idiomas |
| 19 | **Cache e geração estática**: páginas com ISR (`revalidate`) e `generateStaticParams` em 6 rotas | Incluir `lang` nos params. Com `next/root-params`, o idioma entra sozinho na chave de cache de funções com `'use cache'`. Ativando Cache Components no futuro, o layout precisa de `generateStaticParams` (o guia exige) |
| 20 | **App**: Expo Router não tem rotas por idioma, e textos estão em 70 arquivos | Idioma é estado do app: `expo-localization` + escolha em Perfil (AsyncStorage) + `preferredLanguage`. `useT()` com os mesmos JSON. Links para o site (`openSite`) recebem o prefixo |
| 21 | **Lançar pela metade** (idioma com textos faltando) | `NEXT_PUBLIC_ENABLED_LOCALES`: o código entra em produção com só `pt` ligado; `en` e `es` são ligados juntos, depois da revisão |

---

## 5. Etapas

Cada etapa termina com o site em produção **sem mudança visível em português**, até a E9.

### E0 — Preparação (½ dia)

- [ ] Revisores aprovam o glossário (`i18n-glossario.md`) e o tratamento em espanhol (tú/usted)
- [ ] Branch `i18n` com merges curtos na `main` por etapa; avisar sobre o congelamento da E2
- [ ] Definir as 3 telas de referência para a revisão visual (Início, Perfil do profissional, Publicar oportunidade)

**Pronto quando:** glossário aprovado.

### E1 — Base compartilhada (1–2 dias)

- [ ] `packages/shared/src/i18n/`: `locales.ts`, `pt.json` inicial, `types.ts`, `translate.ts` (variáveis e plural), `format.ts`, `labels.ts`
- [ ] Scripts `i18n:check`, `i18n:export`, `i18n:import` + `i18n:check` no CI
- [ ] Testes unitários de `translate` (variáveis, plural pt/en/es) e `format`

**Pronto quando:** `npm run i18n:check` passa e os helpers têm testes.

### E2 — Roteamento do site (2–3 dias, congelar o site)

- [ ] `git mv` de `app/*` para `app/[lang]/*` (exceto `api/`, `robots.ts`, `sitemap.ts`)
- [ ] `proxy.ts` (seção 3.2), `NEXT_PUBLIC_ENABLED_LOCALES=pt`
- [ ] `app/[lang]/layout.tsx` com `<html lang>`, `generateStaticParams`, `I18nProvider` (ainda com textos fixos)
- [ ] `global-not-found.tsx` + flag no `next.config.ts`
- [ ] `localizedHref`, `LocalizedLink`; trocar os 67 `href` e as 22 navegações; `useAuth` (`/blocked`, `/admin`, `BLOCKED_ALLOWED_PATHS`); redirect `/admin/users` no `next.config.ts`
- [ ] Testes do `proxy` com `next/experimental/testing/server` (`isRewrite`, `getRedirectUrl`): `/`, `/pt/x`, `/en/x` desligado → 404, cookie, `Accept-Language`

**Pronto quando:** `next build` passa, todas as URLs atuais respondem igual, testes do proxy passam, Vercel em produção sem diferença.

### E3 — Textos do site (4–6 dias, em PRs por área)

Ordem: (1) layout, navbar, rodapé, Início · (2) Busca, perfil público, cards · (3) Oportunidades · (4) Artigos e vagas · (5) Login, cadastro, perfil/configurações, bloqueio · (6) Páginas institucionais · (7) Termos e Privacidade (por último, com texto revisado)

- [ ] Extrair textos para `pt.json` mantendo o português **idêntico**
- [ ] Validações zod com chaves (dificuldade 7); `z.config` com o idioma
- [ ] Datas, notas e plurais com `format.ts`
- [ ] `auth.languageCode` antes de enviar e-mails do Firebase Auth

**Pronto quando:** nenhum texto visível fixo nas áreas da etapa (busca por acentos/palavras comuns nos `.tsx`), português igual ao de antes.

### E4 — Dados e busca (1–2 dias)

- [ ] Rótulos de categorias, dias, status e motivos de denúncia por `labels.ts` em selects, filtros, cards e perfis
- [ ] `toSearchTokens` com os rótulos da categoria nos 3 idiomas; sinônimos de serviços nos radicais da busca
- [ ] Script `scripts/reindex-search-tokens.mjs` (o responsável roda em produção)
- [ ] Campo `language` em `posts` (regras: `isValidPost` aceita `language in ['pt','en','es']`) + selo no card

**Pronto quando:** "electrician"/"electricista" encontram eletricistas nos emuladores; testes de regras passam.

### E5 — SEO (1 dia)

- [ ] `createPublicMetadata(locale, …)`: título, descrição, `canonical`, `alternates.languages` com `x-default`, `openGraph.locale`
- [ ] `sitemap.ts` com as URLs dos idiomas ligados; `robots.ts` sem mudança
- [ ] `opengraph-image.tsx` e `/api/og` com texto no idioma

**Pronto quando:** HTML das páginas tem `hreflang` corretos e o sitemap lista só os idiomas ligados.

### E6 — Backend (1 dia)

- [ ] `preferredLanguage` em `users/{uid}`: regras (`allowedFields` + validação), `USER_PROFILE_FIELDS`, testes de regras
- [ ] Seletor de idioma grava cookie e, logado, `preferredLanguage`
- [ ] Functions com `functions/i18n.js`: `notifyMatchingProfessionals`, `maintainOpportunities`, `notifyMembersOfNewPost` (agrupado por idioma); `sendPushNotification` usa o texto já gravado
- [ ] Modelos de e-mail do Firebase Auth em inglês e espanhol (console)

**Pronto quando:** teste nos emuladores mostra notificações no idioma de cada usuário.

### E7 — App (2–3 dias)

- [ ] `expo-localization`; `LocaleProvider` com AsyncStorage + `preferredLanguage`; seletor em Perfil (junto de Aparência)
- [ ] `useT()` com os JSON do `packages/shared` (Metro já resolve `packages/shared`)
- [ ] Extrair ~400 textos de `apps/mobile/src`, rótulos das abas (`app-tabs.tsx`, `app-tabs.web.tsx`), `accessibilityLabel`s
- [ ] `openSite` e compartilhamentos com prefixo do idioma; `auth.languageCode`

**Pronto quando:** app inteiro em en/es no navegador (`localhost:8081`) e no emulador Android, com a fonte do sistema maior.

### E8 — Tradução e revisão (prazo dos revisores)

- [ ] Primeira versão de `en.json`/`es.json` gerada com IA seguindo o glossário
- [ ] `i18n:export` → planilha para cada revisor → `i18n:import`
- [ ] Revisão dos Termos e da Privacidade (com o aviso de prevalência do português)
- [ ] Revisão visual das telas de referência (dificuldade 15)

**Pronto quando:** revisores aprovam os dois idiomas; `i18n:check` passa.

### E9 — Lançamento (½ dia + acompanhamento)

- [ ] Ligar `en` e `es` em um ambiente de prévia da Vercel com `noindex`; revisores navegam pelo site e app
- [ ] Produção: `NEXT_PUBLIC_ENABLED_LOCALES=pt,en,es`, seletor visível, sitemap atualizado
- [ ] APK novo do app
- [ ] Posts nas redes anunciando os idiomas
- [ ] Acompanhar por 2 semanas: 404s com prefixo, buscas sem resultado em en/es, mensagens no Fale conosco

**Rollback:** voltar `NEXT_PUBLIC_ENABLED_LOCALES=pt` (as URLs `/en` e `/es` passam a responder 404; português intacto).

---

## 6. Testes

| Tipo | O quê |
| --- | --- |
| Unitário | `translate` (variáveis, plurais), `format`, `labels`, `localizedHref`, sinônimos da busca |
| Proxy | `next/experimental/testing/server`: reescrita do português, redirecionamentos, cookie, `Accept-Language`, idiomas desligados |
| Regras do Firestore | `preferredLanguage` e `posts.language` (suíte `tests/rules`) |
| Functions | Emulador: notificação no idioma de cada usuário |
| Build | `i18n:check`, `tsc`, `lint`, `next build` no CI |
| Visual | Telas de referência em 360/412/1280 px nos 3 idiomas, claro e escuro, fonte grande no Android |

## 7. Tamanho estimado

| Etapa | Esforço |
| --- | --- |
| E0 Preparação | ½ dia |
| E1 Base | 1–2 dias |
| E2 Roteamento | 2–3 dias |
| E3 Textos do site (~1.400) | 4–6 dias |
| E4 Dados e busca | 1–2 dias |
| E5 SEO | 1 dia |
| E6 Backend | 1 dia |
| E7 App (~400 textos) | 2–3 dias |
| E8 Revisão | prazo dos revisores |
| E9 Lançamento | ½ dia |
| **Total de desenvolvimento** | **13–19 dias** |

## 8. Pendências do responsável pelo projeto

- [x] Espanhol da América Latina (29/10/2026)
- [x] Revisores nativos de inglês e espanhol (29/10/2026)
- [ ] Aprovar o glossário e o tratamento em espanhol (tú ou usted)
- [ ] Rodar em produção o script de reindexação da busca (E4)
- [ ] Traduzir os modelos de e-mail no console do Firebase (E6)
