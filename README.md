# Skillsy

Plataforma que conecta membros da comunidade a profissionais e serviços de confiança: busca de prestadores, perfis com avaliações e indicações, oportunidades de trabalho e artigos/vagas.

- Produto e público: [PRODUCT.md](PRODUCT.md)
- Design e componentes: [DESIGN.md](DESIGN.md)
- Regras de desenvolvimento (Next.js, Firebase, shadcn/ui): [AGENTS.md](AGENTS.md)

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Firebase**: Auth (Google e e-mail/senha) e Firestore, acessados pelo SDK web
- **UI**: Tailwind CSS 4 + shadcn/ui (Base UI), sem cantos arredondados
- **Formulários**: react-hook-form + zod
- **Deploy**: Vercel (a cada push na `main`)

## Rodando localmente

Requer Node 22+.

```bash
npm install
npm run dev
```

A configuração pública do Firebase fica em `firebase-applet-config.json` (não contém segredos; o acesso é controlado pelas regras do Firestore).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint (as regras de hooks do React são erro) |
| `npm run test:rules` | Testes das regras do Firestore no emulador (requer Java) |
| `npm run deploy:firestore-rules` | Publica `firestore.rules` e os índices |

Os scripts `backfill:*` e `inspect:*` em `scripts/` são manutenções pontuais de dados via API REST do Firestore (usam o token do `gcloud`).

## Firestore

As regras em [`firestore.rules`](firestore.rules) são a principal camada de segurança: toda leitura e escrita vem do cliente.

- **Testes**: [`tests/rules/`](tests/rules/) cobre leitura de dados privados, avaliações e indicações. Para rodar, instale Java (`sudo apt install openjdk-21-jre-headless`) e use `npm run test:rules`. O CI roda os mesmos testes em cada push e PR.
- **Avaliações**: o perfil público guarda `ratingSum` + `reviewCount` (a média é calculada na leitura). Cada avaliação tem o id `{avaliador}_{prestador}` e as regras conferem que a soma cresce exatamente pela nota. Donos não podem alterar esses números.
- **Correção de agregados**: o botão **Recalcular avaliações** no painel admin refaz notas e indicações a partir dos documentos de origem.

### Cloud Functions

O projeto está no plano **Spark**, que não permite publicar Functions. O código em [`functions/`](functions/index.js) (alertas de oportunidades para profissionais, expiração e lembrete de 20 dias) fica em backlog até a migração para o plano Blaze.

## Cache e headers

- Páginas públicas usam ISR com `revalidate = 60`: mudanças aparecem em até 1 minuto.
- Headers de segurança ficam em [`next.config.ts`](next.config.ts). A CSP está em modo `Report-Only` até ser validada em produção.
