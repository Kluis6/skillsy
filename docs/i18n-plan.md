# Multi-idioma (pt-BR, en, es-419) — plano de implantação

Registrado em 29/10/2026. **Status: planejado, não iniciado.** Glossário para os revisores: [`i18n-glossario.md`](./i18n-glossario.md).

Objetivo: site e app em **português do Brasil (padrão), inglês e espanhol da América Latina**, usando os recursos nativos do Next.js 16 no site e os mesmos dicionários no app.

**Processo de tradução (29/10/2026):** a tradução segue o glossário e as referências de dicionário e estilo pesquisadas (RAE/Fundéu, guias de estilo de interface, termos oficiais da Igreja); os revisores nativos, já definidos, revisam **depois** (E8).

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
- **Uso fora do Brasil.** Estados (UF), telefone com +55 e WhatsApp continuam brasileiros. Esta etapa entrega pt, en e es com seletor na plataforma atual. Atender pessoas **nos próprios países** da América Latina, com o idioma entregue pela localização, está planejado em `docs/latam-plan.md` (backlog, decisão do responsável em 06/11/2026). Artigos, vagas e oportunidades já guardam idioma e país de origem (dificuldade 12), para que conteúdo de fora nunca gere alerta para o Brasil.
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
| Espanhol | América Latina, **tú** (padrão de produtos para o público geral), plural *ustedes*, vocabulário neutro (ver glossário) |

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
| 12 | **Notificações e push**: o alerta pertence ao conteúdo, não a quem recebe. Uma vaga ou artigo publicado nos Estados Unidos, em inglês, não pode avisar quem está no Brasil (decisão do responsável, 05/11/2026) | Artigos, vagas e oportunidades gravam o **idioma** e o **país** de origem (`language`, `country`, padrão `pt`/`BR`). As Functions só avisam quem tem o mesmo país (e, nas oportunidades, o mesmo estado, como hoje) e o mesmo idioma de preferência (`preferredLanguage`). O título e a mensagem da notificação ficam no idioma em que o conteúdo foi criado; o sino só traduz a moldura ("Notificações", "Agora") |
| 13 | **E-mails do Firebase Auth** (recuperar senha) saem no idioma do console | `auth.languageCode = locale` antes de `sendPasswordResetEmail` (site e app) e modelos traduzidos no console do Firebase |
| 14 | **SEO**: conteúdo duplicado e canonical | `alternates.canonical` por idioma, `alternates.languages` (`pt-BR`, `en`, `es-419`, `x-default` = pt) em `createPublicMetadata`; sitemap com as 3 versões de cada URL; OG com `locale` e texto no idioma |
| 15 | **Textos mais longos** em inglês e espanhol (+15–30%) quebram botões, chips, abas e cards | Etapa de revisão visual em larguras de 360, 412 e 1280 px; textos de botão curtos no glossário; `numberOfLines`/`truncate` onde fizer sentido |
| 16 | **Termos da comunidade** ("ala", "estaca", "membro verificado", "Indicar", "Conectar") sem tradução óbvia | Glossário (`i18n-glossario.md`) baseado em dicionários, guias de estilo e no uso oficial da Igreja em cada idioma (ala → *ward* / *barrio*); revisores ajustam depois e as correções voltam ao glossário |
| 17 | **Páginas legais** traduzidas podem gerar divergência jurídica | Tradução revisada e aviso "Em caso de divergência, prevalece a versão em português". Aceite (`termsVersion`) continua único |
| 18 | **Tradução feita fora do código** (revisores não programam) | `npm run i18n:export` gera uma planilha (chave, pt, en, es, contexto); `i18n:import` traz de volta. `i18n:check` no CI garante as mesmas chaves e variáveis nos 3 idiomas |
| 19 | **Cache e geração estática**: páginas com ISR (`revalidate`) e `generateStaticParams` em 6 rotas | Incluir `lang` nos params. Com `next/root-params`, o idioma entra sozinho na chave de cache de funções com `'use cache'`. Ativando Cache Components no futuro, o layout precisa de `generateStaticParams` (o guia exige) |
| 20 | **App**: Expo Router não tem rotas por idioma, e textos estão em 70 arquivos | Idioma é estado do app: `expo-localization` + escolha em Perfil (AsyncStorage) + `preferredLanguage`. `useT()` com os mesmos JSON. Links para o site (`openSite`) recebem o prefixo |
| 21 | **Lançar pela metade** (idioma com textos faltando) | `NEXT_PUBLIC_ENABLED_LOCALES`: o código entra em produção com só `pt` ligado; `en` e `es` são ligados juntos, depois da revisão |

---

## 5. Etapas

Cada etapa termina com o site em produção **sem mudança visível em português**, até a E9.

### E0 — Preparação (½ dia)

- [x] Glossário e tom de voz com base em dicionários, guias de estilo e termos oficiais da Igreja (29/10/2026)
- [x] Trabalho direto na `main` (regra do projeto: commit, push e deploy a cada etapa), com cada etapa publicada sem mudar nada visível até a E9
- [ ] Definir as 3 telas de referência para a revisão visual (Início, Perfil do profissional, Publicar oportunidade)

**Pronto quando:** branch criada e telas de referência definidas (o glossário não depende mais de aprovação prévia).

### E1 — Base compartilhada (1–2 dias)

- [x] `packages/shared/src/i18n/`: `locales.ts`, `pt.json`/`en.json`/`es.json` iniciais, `translate.ts` (tipos, variáveis e plural; zero sempre no plural), `format.ts`. `labels.ts` fica para a E4
- [x] Scripts `i18n:check`, `i18n:export`, `i18n:import` + `i18n:check` no CI
- [x] Testes unitários de `translate` (variáveis, plural pt/en/es), `format`, `locales` e da ida e volta da planilha (`npm run test:i18n`, no CI)

**Pronto quando:** `npm run i18n:check` passa e os helpers têm testes.

### E2 — Roteamento do site (2–3 dias, congelar o site)

- [x] `git mv` de `app/*` para `app/[lang]/*` (ficam na raiz: `api/`, `robots.ts`, `sitemap.ts`, `globals.css`, ícones e `opengraph-image.tsx` do site)
- [x] `proxy.ts` com as regras em `packages/shared/src/i18n/routing.ts` (função pura; `Accept-Language` lido por um parser próprio de ~20 linhas, sem `negotiator`/`intl-localematcher`), `NEXT_PUBLIC_ENABLED_LOCALES=pt` (padrão quando a variável não existe)
- [x] `app/[lang]/layout.tsx` com `lang` de `next/root-params`, `<html lang>`, `generateStaticParams` e 404 para idioma desligado. `I18nProvider` vai para a E3, junto dos primeiros textos
- [x] `global-not-found.tsx` + `experimental.globalNotFound`; a página 404 virou `components/not-found-page.tsx`, usada pelos dois
- [x] `localizedHref` (`lib/i18n/href.ts`). A troca dos `href`, das navegações e dos caminhos do `useAuth` fica para a E3, arquivo por arquivo junto dos textos: com só o português ligado nada muda, e com outro idioma ligado o cookie `lang` já leva o link sem prefixo para o idioma certo
- [x] Testes das regras do proxy em `tests/i18n/routing.test.mjs`: `/`, `/pt/x` → 308, `/en/x` desligado → 404, cookie, `Accept-Language`, imagens `opengraph-image` em `/pt`
- [x] Conferido com `next build` + `next start`: URLs atuais com 200, `/pt/x` → 308, `/en` e `/es` → 404, 404 com o visual da Skillsy, imagens de perfil e artigo, `robots.txt`, `sitemap.xml`, `/api/og` e navegação pelo cliente
- Observação para a E5: as imagens de compartilhamento de perfil e artigo passaram a ter `/pt/` na URL (`/pt/profile/…/opengraph-image-…`); o proxy serve essas URLs sem redirecionar

**Pronto quando:** `next build` passa, todas as URLs atuais respondem igual, testes do proxy passam, Vercel em produção sem diferença.

### E3 — Textos do site (4–6 dias, em PRs por área)

Ordem: (1) layout, navbar, rodapé, Início · (2) Busca, perfil público, cards · (3) Oportunidades · (4) Artigos e vagas · (5) Login, cadastro, perfil/configurações, bloqueio · (6) Páginas institucionais · (7) Termos e Privacidade (por último, com texto revisado)

- [x] Extrair textos para `pt.json` mantendo o português **idêntico**. Conferência: retrato do texto de 21 páginas públicas (desktop e celular: texto, título, metas, `aria-label`, `placeholder`, `title`, `alt`) antes e depois de cada área, comparado como texto corrido
  - [x] Base: `lib/i18n/server.ts` (`getT`, `getLocale`, `getMessages` com `next/root-params`), `lib/i18n/provider.tsx` (`I18nProvider`, `useT`, `useLocale`, `useHref`), chaves tipadas a partir do `pt.json` (`keys.ts`)
  - [x] (1) Layout e metadados do site, menu (o menu da busca passou a reutilizar o da barra), rodapé, botão de tema, Início (hero, categorias, benefícios, Fale conosco). Nomes das categorias ficam para a E4 (são termos de busca); mensagens do zod ficam para o item de validações
  - [x] (2) Busca, perfil público, cards, filtro de localização. `rich()` para elementos dentro do texto (`lib/i18n/rich.tsx`); datas relativas com date-fns no idioma (`lib/i18n/date-fns.ts`), mantendo o português igual; nota com `formatRating` (o perfil mostrava "4.5" e passou a "4,5", como nos cards). Rótulos de dias, categorias e motivos de denúncia ficam para a E4
  - [x] (3) Oportunidades (mural, para você, encontrar ajuda, formulário, acompanhamento de 20 dias) e o sino de notificações (só a moldura; o texto de cada aviso fica no idioma do conteúdo, dificuldade 12). Urgência traduzida no site; o pacote compartilhado mantém os rótulos em português para o app até a E7
  - [x] (4) Artigos e vagas: lista, página do artigo, ações (compartilhar, editar, apagar, denunciar), Minhas publicações e editor. Categoria e status (artigo/vaga, rascunho/em revisão…) traduzidos no site; `getPostExcerpt` aceita o texto padrão no idioma
  - [x] (5a) Login e cadastro (modal, /signin, /recovery), bloqueio, contatos, aviso de cookies e diálogo de novos termos. E-mail de redefinição de senha no idioma da página (`auth.languageCode`). Descrições das imagens do login ganharam acentos
  - [x] (5b) Perfil/configurações (identidade, vínculo com a comunidade e consentimento da ala, serviço, endereço, contatos, galeria, cancelar conta). Conferência das telas com login: cada mensagem do `pt.json` precisa existir idêntica no código anterior à E3 (variáveis como coringa); `i18n:check` passou a recusar mensagens com espaço nas pontas
  - [x] (6) Páginas institucionais (Participe, O que é Skillsy, Doação, seção "como funciona"), páginas de erro e 404. O 404 de endereços inexistentes (`global-not-found`, fora de `app/[lang]`) fica em português; a página de doação perdeu um trecho que nunca aparecia (QR Code ausente) e "O que é Skillsy" uma lista que não era exibida
  - [x] (7) Termos e Privacidade: primeira tradução completa em `lib/legal/{terms,privacy}.{en,es}.ts` (mesmos ids de seção; teste `tests/i18n/legal.test.mjs` compara a estrutura com o português), aviso "prevalece a versão em português" nas traduções e data no formato de cada idioma. Revisão jurídica e dos revisores na E8
- [x] Prévia local com `NEXT_PUBLIC_ENABLED_LOCALES=pt,en,es` (05/11/2026): 44 páginas em `/en` e `/es` sem nenhuma chave crua; sobras em português só em conteúdo de usuários, categorias (E4), `meta keywords` (E5) e no 404 de endereços inexistentes, que fica fora de `app/[lang]` (E5: o proxy passa o idioma por cabeçalho)
- [x] Links com o idioma: `lib/i18n/navigation.tsx` (`Link`, `useRouter`, `usePathname` sem o prefixo) em todo o site, fora o painel administrativo; regra de lint (`no-restricted-imports`) impede voltar a usar `next/link` e `useRouter`/`usePathname` do Next. Conferido com os três idiomas ligados: nenhum link de `/en` e `/es` sem o idioma, busca da home vai para `/en/search`
- [x] Mensagens de erro dos serviços que chegam à tela e o `ErrorBoundary` global (agora dentro do `I18nProvider`). Erros internos de formato de documento (`profile-documents.ts`) ficam em português
- [x] Validações: os esquemas do pacote compartilhado continuam com o texto em português, porque o app os mostra direto até a E7. O site traduz pela frase: `useValidationMessage()` procura a mensagem em `pt.json` "validation" (aceita modelos como "Ano deve estar entre 1830 e {year}") e mostra no idioma da página. `tests/i18n/validation.test.mjs` garante que toda mensagem dos esquemas do site está no dicionário. Na E7, o app passa a usar o mesmo mecanismo
- [x] Datas, notas e plurais com `format.ts` (datas relativas com date-fns no idioma, para o português sair igual)
- [x] `auth.languageCode` antes de enviar e-mails do Firebase Auth (site; o app fica para a E7)

**Pronto quando:** nenhum texto visível fixo nas áreas da etapa (busca por acentos/palavras comuns nos `.tsx`), português igual ao de antes.

### E4 — Dados e busca (1–2 dias)

- [x] Rótulos de categorias, dias e motivos de denúncia (`packages/shared/src/i18n/labels.ts` + `useLabels()`) em selects, filtros, cards, perfis, oportunidades e carrosséis da Início. O valor gravado continua em português e é a chave
- [x] Busca entre idiomas **sem reindexar**: a consulta é traduzida em vez dos perfis. Cada palavra vira um grupo de alternativas (`toSearchStemGroups`): a própria e a portuguesa (`buildSearchSynonyms`: rótulos de categoria traduzidos + ~70 profissões em inglês e espanhol); a consulta usa `array-contains-any` quando preciso, com os mesmos índices. Em português nada muda. Conferido com dados reais: "woodworking", "carpenter" e "carpintero" acham o marceneiro
- [x] ~~Script de reindexação~~: dispensado, a tradução é feita na consulta
- [x] `language` e `country` opcionais em `users`, `public_profiles`, `posts` e `opportunities` (regras + testes; publicadas em 05/11/2026). Seletor de idioma no editor de artigos, no formulário de oportunidade (padrão: idioma da página) e no perfil (padrão: português); selo do idioma (`LanguageBadge`) quando difere do idioma da página
- [x] Busca e listas ligadas à origem (decisão do responsável, 05/11/2026): **o país filtra, o idioma ordena** (`byOrigin`): Início, busca, sugestões, mural, para você, encontrar ajuda e artigos mostram só o país de quem navega (Brasil por padrão; documento sem campo = BR) e põem primeiro o conteúdo no idioma da página. O seletor de país e as divisões de outros países ficam para quando abrir outro país

**Pronto quando:** "electrician"/"electricista" encontram eletricistas nos emuladores; testes de regras passam.

### E5 — SEO (1 dia)

- [x] `createPublicMetadata` (agora assíncrono) e o layout raiz leem o idioma da página: `canonical` com o prefixo, `alternates.languages` (`pt-BR`, `en`, `es-419`, `x-default` = português) só quando há mais de um idioma ligado, `og:locale` e `og:url`; palavras-chave dos metadados no dicionário
- [x] `sitemap.ts`: cada página em cada idioma ligado, com `xhtml:link` alternativos; com só o português, igual ao de antes. `robots.ts` sem mudança
- [x] Imagens de compartilhamento de perfil e artigo com os textos no idioma (`getTFor(params.lang)`, `lib/i18n/translator.ts`); `/api/og` já recebe os textos traduzidos. O `alt` das imagens segue em português (traduzir mudaria a URL das imagens)
- [x] 404 de endereços inexistentes em `/en` e `/es` no idioma certo: o `proxy.ts` passa o idioma no cabeçalho `x-skillsy-locale`, lido por `app/global-not-found.tsx`
- Conferido (06/11/2026) com os três idiomas ligados localmente: `hreflang` e `canonical` em `/en/termos`, sitemap com as alternativas, imagem do perfil em inglês, 404 em inglês e espanhol. Português idêntico em 21 páginas, incluindo metadados

**Pronto quando:** HTML das páginas tem `hreflang` corretos e o sitemap lista só os idiomas ligados.

### E6 — Backend (1 dia)

- [x] `preferredLanguage` em `users/{uid}`: regras (criação e atualização), `USER_PROFILE_FIELDS`, testes de regras. O cadastro grava o idioma da página
- [x] Seletor de idioma (`components/language-switcher.tsx`) no menu (o do rodapé foi removido em 10/11/2026, a pedido do responsável), visível só com mais de um idioma ligado: grava o cookie `lang`, salva `preferredLanguage` quando logado e abre a mesma página no novo idioma. No login, a preferência salva vira o cookie quando ainda não há escolha no aparelho
- [x] `language` e `country` em `posts` e `opportunities` (feito na E4; formulários do app na E7)
- [x] Functions filtram destinatários pela origem do conteúdo (`functions/origin.js`, testado em `tests/i18n/functions.test.mjs`): artigos e vagas avisam só membros do mesmo país e idioma de preferência; oportunidades mantêm categoria + estado e somam país e idioma. Texto no idioma do conteúdo, com a categoria traduzida; textos gerados dos dicionários em `functions/i18n.json` (`npm run i18n:functions`, conferido pelo `i18n:check`). Publicadas em 06/11/2026
- [x] `maintainOpportunities` (lembrete de 20 dias) escreve no idioma da oportunidade
- [ ] Modelos de e-mail do Firebase Auth em inglês e espanhol (console)

**Pronto quando:** teste nos emuladores mostra notificações no idioma de cada usuário.

### E7 — App (2–3 dias)

- [x] `LocaleProvider` (`apps/mobile/src/lib/i18n.tsx`): escolha salva no aparelho (AsyncStorage), depois `preferredLanguage` da conta, depois o idioma do celular (`Intl`, sem `expo-localization`), dentro de `EXPO_PUBLIC_ENABLED_LOCALES` (padrão `pt`, então nada muda até o lançamento). Seletor de idioma em Perfil, junto de Aparência (some com um idioma só)
- [x] `useT()`, `useLabels()`, `useValidationMessage()` e `useFormat()` (datas, notas, contadores com plural, função do profissional) com os mesmos dicionários do site. Textos do app na área `app.<tela>` (cerca de 400 mensagens); o que já existia no site é reaproveitado (urgência, status e categorias de publicação, acompanhamento de 20 dias)
- [x] Todas as telas, abas e componentes, `accessibilityLabel`s e avisos. Erros das bibliotecas e dos esquemas compartilhados passam por `useValidationMessage()`
- [x] Oportunidades e publicações criadas no app gravam o idioma do app; listas de artigos e da Início seguem a origem (`byOrigin`); selo de idioma (`LanguageBadge`) em cartões e no artigo
- [x] `openSite` e compartilhamentos com o prefixo do idioma (`siteUrl`); `auth.languageCode` no e-mail de nova senha
- [x] Conferido: português idêntico ao do commit base (cada texto do `app` existe no código antigo, exceto três plurais que eram montados em pedaços); en/es no navegador (`localhost:8081`) sem chaves cruas em Início, Buscar, Oportunidades, Perfil, Artigos e perfil do profissional
- [ ] Emulador Android com a fonte do sistema maior (no próximo APK, quando o responsável pedir)

**Pronto quando:** app inteiro em en/es no navegador (`localhost:8081`) e no emulador Android, com a fonte do sistema maior.

### E8 — Tradução e revisão (prazo dos revisores)

- [ ] Primeira versão de `en.json`/`es.json` seguindo o glossário e as referências (RAE/Fundéu, guias de estilo de interface)
- [ ] `i18n:export` → planilha para cada revisor → `i18n:import`. Planilhas geradas em 05/11/2026 (`interface.csv`, `termos-e-privacidade.csv` com `npm run i18n:export-legal`, instruções e glossário); correções dos documentos jurídicos voltam à mão para `lib/legal/*.ts`
- [ ] Revisão dos Termos e da Privacidade (com o aviso de prevalência do português)
- [ ] Revisão visual das telas de referência (dificuldade 15)

**Pronto quando:** revisores aprovam os dois idiomas; `i18n:check` passa.

### E9 — Lançamento (½ dia + acompanhamento)

- [ ] Ligar `en` e `es` em um ambiente de prévia da Vercel com `noindex`; revisores navegam pelo site e app
- [x] Produção: `NEXT_PUBLIC_ENABLED_LOCALES=pt,en,es` na Vercel (06/11/2026, decisão do responsável, antes da revisão da E8), seletor visível, sitemap atualizado. O app passa a ter os três idiomas por padrão (chega no próximo APK)
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
- [x] Tradução pelo padrão de dicionários e pesquisa, com revisão depois (29/10/2026)
- [x] ~~Rodar em produção o script de reindexação da busca (E4)~~: não é mais necessário
- [ ] Traduzir os modelos de e-mail no console do Firebase (E6)
