# App mobile do Skillsy — plano

Decidido em 19/10/2026. Escopo da primeira versão: **núcleo da comunidade + oportunidades**, em **monorepo com código compartilhado**, distribuído só por **teste interno** no Google Play.

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Base | **Expo SDK 58** (React Native 0.88), **Expo Router**, TypeScript | Telas por arquivo, builds na nuvem (EAS), atualizações sem loja |
| Monorepo | npm workspaces: `apps/web`, `apps/mobile`, `packages/shared` | Site e app com as mesmas regras de negócio |
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

## Fases

### 0. Monorepo (depois da migração do banco)
- [ ] Mover o site para `apps/web`, configurar workspaces, ajustar a Vercel para a pasta
- [ ] `packages/shared`: tipos, zod, categorias, estados e acesso ao Firebase (recebendo a instância do banco)
- [ ] Site importando do `shared`; CI e deploy iguais

### 1. Imagens no Firebase Storage (site e app)
- [ ] Regras do Storage: cada usuário grava só as próprias imagens, com limite de tamanho e tipo
- [ ] Uploads (foto, capa, galeria, capa de artigo) indo para o Storage; documento guarda só a URL
- [ ] Script para migrar as imagens em base64 existentes; miniaturas para os cards

### 2. Esqueleto do app
- [ ] Expo SDK 58 em `apps/mobile`, Expo Router com abas **Buscar · Oportunidades · Contatos · Perfil**
- [ ] React Native Reusables + NativeWind com os tokens do site (confirmar compatibilidade com o SDK 58)
- [ ] Firebase com sessão persistente + React Query
- [ ] Conta Expo, `eas init` e primeiro build de desenvolvimento Android

### 3. Conta e perfil
- [ ] Login por e-mail e com Google; recuperar senha
- [ ] Perfil público: foto, nota, indicações, galeria, botão de WhatsApp
- [ ] Editar o próprio perfil, com upload de foto e checklist de prontidão

### 4. Comunidade
- [ ] Busca com filtros de categoria e estado (mesma regra de prestador ativo do site)
- [ ] Avaliar e indicar (mesmas regras do Firestore)
- [ ] Contatos salvos

### 5. Oportunidades e push (depende do "sim" para as Cloud Functions)
- [ ] Listar, publicar e encerrar oportunidades
- [ ] Token de push em `users/{uid}/devices`, com regras
- [ ] Functions no banco novo enviando push pelo Expo; tocar na notificação abre a oportunidade

### 6. Teste interno
- [ ] Play Console criado e verificado; app e trilha de teste interno
- [ ] `eas build` (`.aab`) + `eas submit` para o teste interno; convidar testadores

## Pendências do responsável pelo projeto
| Quando | O quê |
| --- | --- |
| Antes da fase 2 | Conta gratuita em expo.dev |
| Antes da fase 5 | "Sim" para ativar as Cloud Functions |
| Antes da fase 6 | Conta no Play Console criada e verificada (US$ 25; contas pessoais novas precisam de 12 testadores por 14 dias antes da produção) |
