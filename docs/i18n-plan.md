# Multi-idioma (pt-BR, en, es) — backlog

Registrado em 29/10/2026. **Status: backlog, não iniciado.** Objetivo: site e app em **português (padrão), inglês e espanhol**, com os recursos nativos do Next.js 16 no site e o mesmo dicionário no app.

## Decisões

| Tema | Decisão | Por quê |
| --- | --- | --- |
| Rotas do site | `app/[lang]/…` com `proxy.ts`, sem prefixo para português: `/artigosevagas` (pt), `/en/artigosevagas`, `/es/artigosevagas` | Guia oficial (`node_modules/next/dist/docs/01-app/02-guides/internationalization.md`). Sem prefixo no pt, os links já compartilhados e os das notificações continuam valendo: o `proxy` faz **rewrite** (não redirect) de `/x` para `/pt/x` |
| Escolha do idioma | 1º o prefixo da URL; 2º um cookie `lang` (escolha manual); 3º o `Accept-Language` do navegador (`@formatjs/intl-localematcher` + `negotiator`); padrão `pt` | Mesma ordem do guia; o cookie evita trocar de idioma sozinho a cada visita |
| Textos | Dicionários JSON em `packages/shared/src/i18n/{pt,en,es}.json`, uma árvore por área (`common`, `nav`, `profile`, `opportunities`, `posts`, `admin`, `legal`…) | O app usa os mesmos arquivos; tipos gerados a partir do `pt.json` (fonte da verdade) acusam chave faltando no build |
| Server Components | `getDictionary()` lendo o idioma com `next/root-params` (`import { lang } from 'next/root-params'`) | Sem passar `lang` por props; o dicionário não vai para o bundle do cliente |
| Client Components (91 hoje) | `I18nProvider` no `app/[lang]/layout.tsx` recebe só as áreas usadas pela página e expõe `useT()` | `root-params` não funciona em Client Components, Server Actions nem Route Handlers |
| Biblioteca | Começar **sem biblioteca** (padrão do guia). Reavaliar `next-intl` se plurais/formatação ICU ficarem trabalhosos | Pedido de usar os recursos do Next.js; o guia cobre rotas, dicionários e geração estática |
| Datas e números | `Intl.DateTimeFormat`/`Intl.NumberFormat` com o idioma atual (hoje há 15 usos fixos em `pt-BR`/`ptBR` do date-fns) | Formatação nativa, sem tradução manual |
| Dados no Firestore | **Categorias e dias continuam gravados em português** (`PROVIDER_CATEGORIES`, `AVAILABILITY_OPTIONS`) e viram chaves; só o rótulo na tela é traduzido | Busca (`searchTokens`), filtros, `notifyMatchingProfessionals` e as regras comparam esses valores; mudar o valor quebraria perfis e oportunidades existentes |
| Conteúdo dos usuários | Perfis, artigos, vagas e oportunidades **não são traduzidos** (aparecem no idioma em que foram escritos) | Fora do escopo da 1ª versão; tradução automática com Gemini (no cliente, regra da plataforma) fica como ideia futura |
| Idioma do usuário | Campo `preferredLanguage` (`pt`/`en`/`es`) em `users/{uid}`, salvo ao trocar de idioma | Notificações e push saem no idioma da pessoa |

## Fases

### 0. Base
- [ ] `packages/shared/src/i18n/`: `pt.json` (extraído do código), `en.json`, `es.json`, tipo `Dictionary` e `LOCALES = ['pt', 'en', 'es']`
- [ ] Script `npm run i18n:check`: mesmas chaves nos três arquivos (rodar no CI)
- [ ] Mapa de rótulos para `PROVIDER_CATEGORIES` e `AVAILABILITY_OPTIONS` (valor salvo → texto por idioma)

### 1. Site — rotas e idioma
- [ ] Mover `app/*` para `app/[lang]/*` (26 páginas; `api/`, `robots.ts`, `sitemap.ts`, ícones e OG ficam fora ou são adaptados)
- [ ] `proxy.ts`: rewrite sem prefixo para `pt`, prefixo `/en` e `/es`, cookie `lang`, `Accept-Language`; ignorar `_next`, `api` e arquivos estáticos
- [ ] `app/[lang]/layout.tsx`: `<html lang>` via `root-params`, `generateStaticParams` com os 3 idiomas, `I18nProvider`
- [ ] Seletor de idioma no rodapé e no menu (troca a URL e grava o cookie)
- [ ] `Link`/`router.push` cientes do idioma (helper `localizedHref`) — revisar redirecionamentos de `useAuth` (`/blocked`, `/admin`) e `next.config.ts` (`/admin/users`)

### 2. Site — textos
- [ ] Extrair ~1.400 textos de `app/`, `components/`, `lib/` e `services/` (mensagens de erro e toasts incluídos)
- [ ] Validações zod em `packages/shared/src/validations.ts`: mensagens por chave
- [ ] Datas e números com `Intl` no idioma atual
- [ ] Páginas legais (`/termos`, `/privacidade`): tradução revisada por humano, com aviso de que a versão em português prevalece

### 3. SEO
- [ ] `lib/public-metadata.ts`: título/descrição por idioma, `openGraph.locale` (`pt_BR`, `en_US`, `es_ES`) e `alternates.languages` (hreflang) com `x-default` = pt
- [ ] `sitemap.ts` com as URLs dos três idiomas; imagens OG (`opengraph-image.tsx`) com o texto no idioma

### 4. Notificações e e-mails
- [ ] `preferredLanguage` em `users/{uid}`: campo nas regras (`allowedFields` + validação `in ['pt','en','es']`) e em `USER_PROFILE_FIELDS`
- [ ] Functions (`notifyMatchingProfessionals`, `maintainOpportunities`, `notifyMembersOfNewPost`, `sendPushNotification`): título/mensagem no idioma de cada destinatário (dicionário em `functions/`)
- [ ] Notificações de admin continuam em português

### 5. App (Expo)
- [ ] `expo-localization` para o idioma do aparelho; escolha manual em Perfil → Aparência/Idioma (AsyncStorage) e `preferredLanguage` no Firestore
- [ ] `useT()` lendo os mesmos JSON de `packages/shared/src/i18n`
- [ ] Extrair ~400 textos de `apps/mobile/src` e os rótulos das abas (`app-tabs.tsx`)
- [ ] Links para o site (`openSite`) com o prefixo do idioma

### 6. Qualidade
- [ ] Tradução feita por IA e **revisada por falante nativo** (en e es), principalmente termos de confiança: "Indicar", "Conectar", "Oportunidade", "membro verificado"
- [ ] Teste visual das telas mais longas em inglês e espanhol (textos maiores quebram layouts)
- [ ] Testes: `proxy` (pt sem prefixo, /en, /es, cookie, `Accept-Language`) e `i18n:check` no CI

## Tamanho estimado

| Parte | Volume hoje | Esforço |
| --- | --- | --- |
| Rotas + proxy + provider (fases 0–1) | 26 páginas, 91 componentes cliente | 2–3 dias |
| Extração dos textos do site (fase 2) | ~1.400 textos | 4–6 dias |
| SEO (fase 3) | metadados, sitemap, OG | 1 dia |
| Notificações (fase 4) | 4 Functions + regras | 1 dia |
| App (fase 5) | ~400 textos, 70 arquivos | 2–3 dias |
| Revisão de tradução e testes (fase 6) | 3 idiomas | depende dos revisores |

## Pendências do responsável pelo projeto
- Definir se espanhol é da Espanha ou da América Latina (vocabulário e `es-419` vs `es-ES`)
- Revisores nativos para inglês e espanhol
- Se haverá domínios por país no futuro (o guia também suporta domínio por idioma; hoje a decisão é por subcaminho)
