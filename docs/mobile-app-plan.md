# App mobile do Skillsy — plano

Decidido em 19/10/2026. Escopo da primeira versão: **núcleo da comunidade + oportunidades**, em **monorepo com código compartilhado**, distribuído só por **teste interno** no Google Play.

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Base | **Expo SDK 58** (React Native 0.88), **Expo Router**, TypeScript | Telas por arquivo, builds na nuvem (EAS), atualizações sem loja |
| Monorepo | Site na raiz, app em `apps/mobile` com dependências próprias; `packages/shared` quando houver código para dividir | Não mexe no build da Vercel |
| Componentes | **React Native Reusables** (equivalente ao shadcn/ui), sobre **rn-primitives** | Mesmos nomes e variantes do `components/ui` do site, copiados para o projeto |
| Estilo | **NativeWind** (Tailwind) com os tokens do `globals.css` | Mesma marca, cinzas neutros, `--radius: 0`, sombras cinza |
| Controles nativos | **@expo/ui** (Jetpack Compose no Android) | Seletores, switches, menus e folhas inferiores com cara do sistema |
| Dados | **Firebase JS SDK 13** (Auth, Firestore, Storage) + AsyncStorage para a sessão | Mesmo SDK do site (que sobe de 12 para 13) |
| Cache | **@tanstack/react-query** | Evita reler o Firestore a cada tela |
| Formulários | **zod** + **react-hook-form**, vindos do `packages/shared` | Mesmas validações do site |
| Login Google | **@react-native-google-signin/google-signin** | Login nativo (exige build de desenvolvimento) |
| Imagens | **expo-image**, **expo-image-picker**, **expo-image-manipulator** | Cache, escolha e redução antes do upload |
| Listas | **@shopify/flash-list** | Listas longas de profissionais e oportunidades |
| Animação | **react-native-reanimated** | Gestos e transições suaves |
| Push | **expo-notifications** + Expo Push Service, disparado pelas Cloud Functions | Avisos de oportunidade |
| Distribuição | **EAS Build** (`.aab`) + **EAS Submit** para a trilha de teste interno; **EAS Update** | Teste interno pelo Play, correções sem nova versão |
| Desenvolvimento | **Firestore Emulator** | Não gastar o banco de produção ao desenvolver |

Plano B para componentes, se o Reusables não funcionar no SDK 58: **gluestack-ui** (mesma ideia de copiar e editar).

## Design

Material 3 adaptado à identidade da Skillsy (20/10): Inter/Outfit, cantos quadrados, cores do site, sombras cinza, um ícone por significado. Barra de busca, chips de filtro com painel inferior, FAB, snackbar, abas superiores, áreas de toque de 48dp. Estrutura do GetNinjas (22/10): abas Início · Buscar · Oportunidades · Perfil ("Entrar" sem conta), Início com busca, atalhos, carrosséis de serviços com fotos da Skillsy, card em destaque, profissionais da comunidade e banners; Buscar com Recomendados e Todas as categorias; estados vazios com duas ações; publicação em passos — sem moedas nem contato liberado antes do acordo. Contatos ficam em Perfil → Meus contatos.

## Fases

### 0. Monorepo
- [x] Banco migrado (20/10) e emuladores locais (`npm run dev:local`)
- [x] App em `apps/mobile`; o site fica na raiz (decidido em 20/10 para não mudar a Vercel) e o TypeScript/ESLint dele ignoram `apps/`
- [x] `packages/shared` (alias `@skillsy/shared/*`): tipos, estados, categorias, tokens e plano de busca, regras de listagem, formatação e link de WhatsApp. Sem Firebase: cada lado monta a própria consulta, porque site (SDK 12) e app (SDK 13) têm cópias diferentes do SDK
- [x] Site importando do `shared`; CI e deploy iguais

### 1. Imagens no Firebase Storage (site e app)
- [ ] Regras do Storage: cada usuário grava só as próprias imagens, com limite de tamanho e tipo
- [ ] Uploads (foto, capa, galeria, capa de artigo) indo para o Storage; documento guarda só a URL
- [ ] Script para migrar as imagens em base64 existentes; miniaturas para os cards

### 2. Esqueleto do app
- [x] Expo SDK 58 em `apps/mobile`, Expo Router com abas **Buscar · Oportunidades · Contatos · Perfil**
- [x] React Native Reusables + NativeWind 4 com os tokens do site (`npm run sync-theme`)
- [x] Firebase com sessão persistente (`@firebase/auth` + AsyncStorage) + React Query; `npm run web:local` / `android:local` usam os emuladores
- [x] Build local de debug (`npx expo run:android`, sem Expo Go nem EAS) — instalar no celular por USB

### 3. Conta e perfil
- [x] Login por e-mail e recuperar senha; criar conta abre o site
- [ ] Login com Google (precisa do SHA-1 do app no Firebase)
- [x] Perfil público: foto, capa, nota, indicações, sobre, atendimento, galeria, botão de WhatsApp (abre da lista sem nova leitura)
- [x] Avaliações e indicações no perfil (avaliar, indicar, conectar)
- [ ] Editar o próprio perfil no app, com upload de foto (hoje abre o site)

### 4. Comunidade
- [x] Busca por termo com a mesma regra e ordenação do site
- [x] Filtros de serviço e estado; perfil completo ao tocar no card
- [x] Avaliar e indicar (mesmas regras do Firestore)
- [x] Contatos salvos (Conectar no perfil, lista na aba Contatos)

### 5. Oportunidades e push (Cloud Functions já publicadas em 20/10)
- [x] Listar oportunidades com filtros; profissional logado responde pelo WhatsApp (mesma regra do site)
- [x] Publicar em passos, encerrar, reativar e responder o lembrete de 20 dias
- [ ] Token de push em `users/{uid}/devices`, com regras
- [ ] Functions no banco novo enviando push pelo Expo; tocar na notificação abre a oportunidade

### 6. Teste interno
- [ ] Play Console criado e verificado; app e trilha de teste interno
- [ ] `eas build` (`.aab`) + `eas submit` para o teste interno; convidar testadores

## Pendências do responsável pelo projeto
| Quando | O quê |
| --- | --- |
| Antes da fase 6 | Conta gratuita em expo.dev (só para EAS Build/Submit; o desenvolvimento usa build local) |
| Antes da fase 5 | "Sim" para ativar as Cloud Functions |
| Antes da fase 6 | Conta no Play Console criada e verificada (US$ 25; contas pessoais novas precisam de 12 testadores por 14 dias antes da produção) |
