---
name: Skillsy
description: Rede de confiança para encontrar talentos, serviços e oportunidades na comunidade.
colors:
  trust-blue: "#0066FF"
  connection-blue: "#00A3FF"
  proof-gold: "#FFB800"
  clean-white: "#FFFFFF"
  community-surface: "#F0F7FF"
  deep-ink: "#001A41"
  steady-muted: "#4B5563"
  soft-border: "#E5E7EB"
  night-bg: "#0F172A"
  night-surface: "#1E293B"
typography:
  display:
    fontFamily: "Outfit, Inter, Arial, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Outfit, Inter, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0"
  title:
    fontFamily: "Outfit, Inter, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.trust-blue}"
    textColor: "{colors.clean-white}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.clean-white}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "40px"
  surface-panel:
    backgroundColor: "{colors.clean-white}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  trust-chip:
    backgroundColor: "{colors.community-surface}"
    textColor: "{colors.trust-blue}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
---

# Design System: Skillsy

## 1. Overview

**Creative North Star: "A Rede Confiável"**

Skillsy deve parecer uma rede comunitária confiável antes de parecer um marketplace. A experiência visual precisa dizer: aqui existem pessoas reais, serviços reais, indicações responsáveis e uma forma simples de encontrar ajuda sem ruído.

O produto usa familiaridade como virtude. Telas autenticadas devem ser quietas, previsíveis e orientadas à tarefa; páginas públicas podem ser mais emocionais, mas ainda precisam provar utilidade com perfis, categorias, localização, avaliações e sinais claros de confiança.

**Key Characteristics:**
- Humano, direto e comunitário.
- Azul como sinal de ação e confiança, não decoração.
- Superfícies claras, bordas discretas e sombras raras.
- Copy curta que explica consequência, visibilidade e próximos passos.
- Componentes consistentes antes de efeitos visuais.

## 2. Colors

A paleta é restrita: azul para confiança e ação, dourado para prova/avaliação, branco e azul muito claro para superfície.

### Primary
- **Trust Blue**: cor principal de ação, foco e seleção. Use em botões primários, filtros selecionados, links importantes e sinais de perfil pronto.

### Secondary
- **Connection Blue**: apoio visual para momentos públicos ou brand, usado com moderação em ilustrações, fundos sutis e estados informativos.

### Tertiary
- **Proof Gold**: sinal de reputação e avaliação. Use apenas para estrelas, pontuação e destaques realmente ligados a prova social.

### Neutral
- **Clean White**: superfície principal de cards, painéis, dialogs e áreas de conteúdo.
- **Community Surface**: fundo de página e áreas de apoio; não deve competir com conteúdo.
- **Deep Ink**: texto principal, títulos, dados importantes e labels críticos.
- **Steady Muted**: textos auxiliares, descrições e metadados.
- **Soft Border**: divisores, contornos de painel e limites de input.

### Named Rules
**The Blue Has A Job Rule.** Azul forte só entra quando há ação, estado selecionado, foco ou confiança. Azul decorativo repetido enfraquece a marca.

**The Proof Gold Rule.** Dourado pertence a reputação, avaliação e destaque legítimo. Nunca use como decoração genérica.

## 3. Typography

**Display Font:** Outfit, com Inter e Arial como fallback.  
**Body Font:** Inter, com Arial como fallback.  
**Label/Mono Font:** não há fonte mono na identidade principal.

**Character:** Outfit dá presença e calor para a marca; Inter mantém produto, formulários e dados legíveis. A combinação deve parecer clara e confiável, não editorial ou experimental.

### Hierarchy
- **Display** (900, hero only, line-height 0.95): usado em heróis públicos e mensagens centrais de marca.
- **Headline** (700, 30px, line-height 1.15): usado em cabeçalhos de página e seções principais.
- **Title** (700, 20px, line-height 1.25): usado em cards, painéis e dialogs.
- **Body** (400, 16px, line-height 1.6): usado em descrições, conteúdo e orientação.
- **Label** (600, 12px, letter-spacing 0): usado em campos, filtros, chips e metadados.

### Named Rules
**The Product Type Rule.** Telas de produto não usam display gigante. Headings devem guiar tarefa, não disputar atenção.

**The No Tiny Help Rule.** Texto de ajuda e erro nunca deve cair abaixo de 12px. Se importa para decisão, precisa ser legível.

## 4. Elevation

Skillsy usa profundidade por camadas tonais, bordas e espaçamento. Sombras são permitidas em heróis públicos, overlays e estados de hover relevantes, mas produto deve ser flat por padrão.

### Shadow Vocabulary
- **State Lift** (`box-shadow: 0 8px 24px rgba(0, 102, 255, 0.10)`): use em cards ou CTAs apenas quando o estado precisa se destacar.
- **Dialog Lift** (`box-shadow: 0 20px 60px rgba(0, 26, 65, 0.18)`): reservado para dialogs e overlays.

### Named Rules
**The Flat By Default Rule.** Se um painel já tem borda e fundo, não adicione sombra. Profundidade precisa indicar estado ou camada.

## 5. Components

### Buttons
- **Shape:** botões de produto usam cantos discretos (4px a 8px); pills são reservados para chips e badges.
- **Primary:** Trust Blue com texto branco, altura de 40px em produto e 48px em CTAs públicos.
- **Hover / Focus:** hover escurece ou reduz opacidade; foco sempre visível por ring do tema.
- **Secondary / Ghost:** fundo branco ou transparente, borda discreta e texto Deep Ink.

### Chips
- **Style:** chips usam superfície clara, borda sutil e texto legível.
- **State:** selecionado vira Trust Blue com texto branco; desmarcado permanece neutro.

### Cards / Containers
- **Corner Style:** painéis principais usam 12px a 16px.
- **Background:** Clean White em conteúdo, Community Surface em apoio.
- **Shadow Strategy:** sem sombra por padrão; use borda e espaçamento.
- **Border:** Soft Border em painéis, listas, filtros e inputs.
- **Internal Padding:** 20px no mobile, 24px no desktop.

### Inputs / Fields
- **Style:** fundo neutro, borda visível, altura mínima de 40px.
- **Focus:** ring/borda do tema, sem glow decorativo.
- **Error / Disabled:** erro em vermelho sem esconder a mensagem; disabled reduz opacidade e mantém leitura.

### Navigation
- **Style:** navegação compacta, sticky quando útil, fundo levemente translúcido apenas quando melhora contexto.
- **Mobile:** drawer e sheet devem ter botões com nomes acessíveis e ações claras.

### Trust Signals
- **Verified badge:** ShieldCheck + texto curto; use para membro verificado e nunca para promessa genérica.
- **Rating badge:** estrela dourada + número; use apenas quando representar avaliação real.
- **Readiness panel:** checklist de perfil deve explicar o que aumenta confiança e descoberta.
- **Trust path:** sequência Perfil / Contexto / Contato para explicar a lógica Skillsy perto de busca, home e decisões de contato. Use como assinatura do produto, não como decoração repetida.

## 6. Do's and Don'ts

### Do:
- **Do** usar `PageHeader`, `SurfacePanel` e `EmptyState` para novas páginas de produto.
- **Do** escrever copy que explique consequência: quem vê, o que muda, qual próximo passo.
- **Do** usar Trust Blue para ação principal, seleção e foco.
- **Do** mostrar sinais de confiança perto da decisão: perfil, busca, contato e moderação.
- **Do** manter textos auxiliares em pelo menos 12px.
- **Do** preferir borda, espaçamento e estado visual claro a sombras pesadas.

### Don't:
- **Don't** criar novos cards com `rounded-[2rem]`, `shadow-2xl` ou decoração gratuita.
- **Don't** usar azul forte como textura de fundo repetida em telas de produto.
- **Don't** usar `text-[10px]` para ajuda, erro, limite de campo ou informação pública.
- **Don't** colocar botão dentro de link ou link dentro de botão.
- **Don't** usar side-stripe colorido como hierarquia.
- **Don't** criar páginas públicas com copy genérica que não prove pessoas, serviços e confiança reais.
