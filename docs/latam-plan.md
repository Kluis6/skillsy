# Skillsy na América Latina — planejamento (backlog)

> **Status:** backlog. Decidido pelo responsável em 06/11/2026: a plataforma atual fica com **português, inglês e espanhol e seletor de idioma**. Abrir para outros países é uma atualização futura, descrita aqui.
>
> **Objetivo:** atender pessoas **nos próprios países** da América Latina, não só quem mora no Brasil e fala outro idioma. A plataforma reconhece onde a pessoa está, entrega o idioma certo, mostra os profissionais e oportunidades do país dela e usa endereço, telefone e regras legais locais.
>
> Base: o trabalho de idiomas (`docs/i18n-plan.md`, E0–E9). O conteúdo já grava idioma e país de origem; busca, listas e alertas já filtram por país.

---

## 1. Ponto de partida (06/11/2026)

| Item | Hoje | Serve para a América Latina? |
|---|---|---|
| Idiomas | pt, en, es (espanhol latino-americano, `es-419`), rotas `/en` e `/es`, seletor | Sim. O espanhol já é o latino-americano |
| Detecção do idioma | URL → cookie `lang` → `Accept-Language` → pt (`proxy.ts`) | Em parte: usa o idioma do navegador, não o país |
| País do conteúdo | `country` em users, public_profiles, posts e opportunities; sem o campo = BR | Sim |
| Filtros e alertas | `byOrigin` (o país filtra, o idioma ordena); Functions só avisam quem é do mesmo país | Sim |
| Escolha do país | Não existe: todo mundo é BR | **Não** |
| Estados | Lista fixa das 27 UFs (`packages/shared/src/brazil-states.ts`) | **Não** |
| Telefone e WhatsApp | Com DDD; `whatsappUrl` sempre põe +55 | **Não** |
| CEP | Não é pedido em lugar nenhum | Sim (não há o que trocar) |
| Termos e privacidade | LGPD, foro brasileiro | **Não** |
| Doação | Pix, em reais | **Não** (só Brasil) |
| Tarefas agendadas | `every day 09:00`, `America/Sao_Paulo` | Em parte |
| Infraestrutura | Firestore em São Paulo; Functions e Storage em us-east1 | Sim (latência aceitável na região) |

---

## 2. Modelo: idioma e país são coisas separadas

O Next.js cuida só do **idioma** (rotas `/es/...` e detecção no `proxy.ts`). O **país** é dado do Skillsy: decide estados, telefone, filtros, alertas e termos. Isso segue o guia `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`. Como o Next.js 15 tirou `request.geo`, a localização vem da hospedagem: na Vercel, `geolocation(request)` de `@vercel/functions` (cabeçalho `x-vercel-ip-country`).

| | Idioma | País |
|---|---|---|
| Valores | `pt`, `en`, `es` | ISO 3166-1: `BR`, `MX`, `AR`, `CO`, `CL`, `PE`… |
| Onde fica | Na URL (`/es/...`) | Cookie `country`, `users.country` e o campo `country` do conteúdo |
| Escolha manual | Seletor de idioma (já existe) | Seletor de país (novo), junto do de idioma |
| Controla | Textos, datas, números | Estados ou regiões, telefone, listas, alertas, termos, doação |

Exemplos:
- Uma pessoa no México vê `/es/` com país MX.
- Uma brasileira que prefere espanhol vê `/es/` com país BR e continua vendo os profissionais do Brasil.
- Uma pessoa nos Estados Unidos vê `/en/` com país US, se um dia os EUA forem abertos. Até lá, o país fica BR e aparece um aviso de que o país ainda não é atendido.

### 2.1 Ordem de decisão (site)

**Idioma:**
1. Prefixo na URL.
2. Cookie `lang` (escolha manual).
3. `preferredLanguage` da conta, quando logada.
4. **Idioma principal do país do IP** (BR → pt; países hispânicos → es; US → en).
5. `Accept-Language`.
6. pt.

**País:**
1. Cookie `country` (escolha manual).
2. `users.country` da conta.
3. País do IP, se for um país aberto.
4. BR.

**Regras de SEO e acessibilidade:**
- **Nunca redirecionar robôs pelo IP.** O Googlebot rastreia quase sempre dos EUA. O redirecionamento por IP só vale para a raiz `/`, na primeira visita, para quem não é robô e não tem cookie. Nas demais páginas, a URL manda.
- Um aviso discreto ("Parece que você está no México. Ver o Skillsy do México?") é melhor que redirecionar em páginas internas.
- Hreflang e `x-default` continuam como estão. O país não entra na URL nesta etapa (ver 2.3).

### 2.2 Ordem de decisão (app)

O app não tem IP no servidor, então:
1. Escolha salva no aparelho.
2. A conta.
3. A **região do celular**, com `expo-localization` (`getLocales()[0].regionCode`), que hoje não usamos e passaria a usar.
4. Opcional: uma rota leve (Function ou rota da Vercel) que devolve o país do IP.
5. BR.

### 2.3 O país na URL? (decisão para depois)

| Opção | Prós | Contras |
|---|---|---|
| **A. Sem país na URL** (recomendado no início) | Nada muda nas rotas; uma página por idioma | O Google mostra a mesma página `/es/` em todos os países hispânicos |
| B. `/es-mx/`, `/es-ar/`… | SEO por país, páginas de busca locais ("eletricistas em Monterrey") | Multiplica páginas quase iguais; mais trabalho em hreflang e sitemap |
| C. Domínio por país (`skillsy.mx`) | Mais confiança local | Um domínio para comprar e manter por país |

Recomendação: começar com **A** e passar para **B** só para páginas de busca por cidade, quando houver volume.

---

## 3. Países

| Grupo | Países | Idioma |
|---|---|---|
| Já atendido | Brasil | pt |
| Hispânicos (19) | México, Guatemala, Honduras, El Salvador, Nicarágua, Costa Rica, Panamá, Cuba, República Dominicana, Porto Rico, Colômbia, Venezuela, Equador, Peru, Bolívia, Chile, Argentina, Uruguai, Paraguai | es |
| Fora do escopo por ora | Haiti (francês/crioulo), Belize, Guiana (inglês), Suriname (neerlandês), Guiana Francesa | — |

Abrir país por país, com uma lista de **países abertos** em `packages/shared` (`OPEN_COUNTRIES`, por variável de ambiente como os idiomas). Um país fechado não aparece no seletor, e o conteúdo de lá não é aceito.

Sugestão de piloto: **1 ou 2 países** onde a comunidade da Igreja já tem contatos e alguém local para moderar e divulgar.

---

## 4. Frentes de trabalho

### A. Detecção, seletor e preferências
- [ ] `@vercel/functions` no `proxy.ts`: país do IP → cookie `country` e idioma sugerido (regras de 2.1, sem afetar robôs)
- [ ] Seletor de país no rodapé e no menu (site) e em Perfil (app), junto do de idioma; grava cookie ou AsyncStorage e `users.country`
- [ ] Aviso "Você está em X?" quando o país do IP difere do escolhido
- [ ] Cadastro: país sugerido pelo IP ou pelo celular, confirmado pela pessoa
- [ ] App: `expo-localization` para a região do aparelho
- [ ] Testes das regras (como `tests/i18n/routing.test.mjs`), incluindo robôs

### B. Regiões (estados, províncias, departamentos)
- [ ] Trocar `brazil-states.ts` por `packages/shared/src/geo/`: um arquivo por país com as subdivisões ISO 3166-2 (código e nome), carregado só para o país em uso
- [ ] O rótulo do campo também muda por país: Estado (BR, MX, VE), Província (AR, EC, PA), Departamento (CO, PE, BO, UY, PY, GT, HN, SV, NI), Região (CL), Província (CR, DO)
- [ ] O bairro também muda de nome: Bairro (BR), Colonia (MX), Barrio (maioria), Comuna (CL), Urbanización (PE)…
- [ ] Dados: manter `state` e `businessState` com o código local (BR guarda a UF, como hoje) e somar `country`; índices compostos do Firestore passam a começar por `country` (`firestore.indexes.json`: hoje `businessState` e `state`)
- [ ] Cidade continua texto livre (sem base de cidades nesta etapa)
- [ ] Código postal: continua sem pedir. Se um dia for necessário, opcional e validado pelo formato do país

### C. Telefone e WhatsApp
- [ ] Guardar no formato internacional E.164 (`+5521…`, `+52…`) com `libphonenumber-js` (validação e formatação por país)
- [ ] Campo com seletor do código do país (padrão: o país da pessoa)
- [ ] `whatsappUrl` (`packages/shared/src/contact.ts`) para de forçar o 55; números antigos sem `+` continuam como brasileiros
- [ ] Migração: script (rodado pelo responsável) que converte os números atuais para `+55…`
- [ ] Mensagens de validação sem "DDD" ("código de área")

### D. Busca, listas e alertas
- [ ] Filtros por país e região no site e no app (hoje: estado brasileiro)
- [ ] Sinônimos regionais em espanhol no mecanismo atual (`packages/shared/src/i18n/search-synonyms.ts`): plomero/fontanero/gasfíter, celular/móvil, mudanza/flete…
- [ ] Functions: oportunidades avisam profissionais do mesmo país **e** região (hoje: país + estado); conferir os testes de `functions/origin.js`
- [ ] Tarefa diária (`every day 09:00`, `America/Sao_Paulo`): rodar em UTC ou por fuso, para o lembrete de 20 dias chegar em horário razoável em cada país
- [ ] Páginas "sem profissionais no seu país ainda" com convite para cadastro

### E. Formatos
- [ ] `Intl` com idioma e país (`es-MX`, `es-AR`, `es-CO`) para datas e números: hoje usamos `es-419`
- [ ] Fuso horário do país nas datas exibidas
- [ ] Moeda local, se algum dia houver preço (hoje não há)

### F. Jurídico e privacidade (precisa de advogado)
- [ ] Termos e privacidade por país ou um documento regional com anexos por país: proteção de dados (México LFPDPPP; Argentina Lei 25.326; Colômbia Lei 1.581; Chile Lei 19.628 e a nova Lei 21.719; Peru Lei 29.733; Uruguai Lei 18.331…), foro, idade mínima e canal do titular dos dados
- [ ] Transferência internacional: os dados ficam em São Paulo (Firestore) e nos EUA (Functions e Storage); declarar isso nos termos de cada país
- [ ] Dado sensível: ala e ano de batismo indicam religião, e a maioria das leis da região exige consentimento expresso (já pedimos; revisar o texto por país)
- [ ] Encarregado ou contato de privacidade por país, se a lei exigir
- [ ] Os documentos em espanhol deixam de ser só "tradução de referência" (hoje vale o português); prevalece a versão do país

### G. Doação
- [ ] Pix é só do Brasil: esconder a doação fora do BR ou oferecer um meio internacional (cartão ou PayPal, a definir)
- [ ] Textos de doação por país

### H. Comunidade e operação
- [ ] Moderadores que falam espanhol (painel de administração: denúncias, artigos, Fale conosco)
- [ ] Fale conosco: resposta em espanhol, com a fila separada por país
- [ ] Termos da Igreja por país: ala/barrio, estaca, ramo (glossário já existe para es-419; conferir variações locais)
- [ ] Redes sociais e divulgação no país piloto

### I. SEO
- [ ] Search Console com segmentação por país (se a opção B ou C de 2.3 for escolhida)
- [ ] Sitemap por idioma (já existe) e, depois, por país
- [ ] Páginas de categoria e cidade em espanhol para buscas locais

### J. App e lojas
- [ ] Play Store: liberar o app nos países abertos; ficha da loja em espanhol (latino-americano)
- [ ] Notificações push com texto no idioma do conteúdo (já é assim)

### K. Infraestrutura e custos
- [ ] Firestore em São Paulo atende bem a América do Sul; medir a latência no México e na América Central
- [ ] Projeção de custo do plano Blaze com mais usuários e mais leituras por país
- [ ] Limites anti-abuso (cadastros, denúncias) por país

---

## 5. Fases

| Fase | Conteúdo | Pronto quando |
|---|---|---|
| **L0 — Decisões** | Países piloto, opção de URL (2.3), meio de doação, advogado | Seção 7 respondida |
| **L1 — Base** (≈1 semana) | Frentes A, B e C com **só o Brasil aberto**: seletor de país, regiões por país, telefone internacional, migração dos números | Brasil funcionando igual a hoje, com país e telefone no novo formato; testes passando |
| **L2 — País piloto em prévia** (≈1 semana) | `OPEN_COUNTRIES=BR,<piloto>` num ambiente de prévia com `noindex`; frentes D e E; textos e sinônimos locais | Pessoas do país piloto se cadastram, buscam e publicam oportunidades na prévia |
| **L3 — Jurídico e operação** (prazo do advogado) | Frentes F, G e H | Termos do país aprovados; moderador definido |
| **L4 — Lançamento do piloto** | Produção, APK, lojas, divulgação; acompanhar 4 semanas | Cadastros e oportunidades reais no país piloto |
| **L5 — Expansão** | Um país por vez: subdivisões, termos, divulgação | Repetível em poucos dias por país |

**Rollback:** tirar o país de `OPEN_COUNTRIES`. O conteúdo dele some das listas, e o Brasil não é afetado.

---

## 6. Riscos

| Risco | Cuidado |
|---|---|
| Redirecionar pelo IP prejudicar o SEO | Só na raiz, nunca para robôs; hreflang como hoje |
| IP errado (VPN, viagem, fronteira) | O país do IP é só sugestão; a escolha manual prevalece e fica salva |
| Plataforma vazia num país novo | Abrir com a comunidade local já convidada; página de convite quando não houver profissionais |
| Números de telefone antigos quebrarem | Sem `+` = Brasil, como hoje; migração revisada antes de rodar |
| Leis diferentes por país | Advogado antes de cada país; prevalece o documento do país |
| Moderação sem quem fale espanhol | Moderador local definido antes do lançamento |

---

## 7. Decisões do responsável (antes da L1)

1. Quais países piloto?
2. País na URL: A (não), B (`/es-mx/`) ou C (domínio)? Recomendado: A no começo
3. Doação fora do Brasil: esconder ou meio internacional?
4. Quem faz a revisão jurídica por país?
5. Quem modera e atende em espanhol?
