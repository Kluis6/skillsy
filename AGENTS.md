# Diretrizes de Desenvolvimento Skillsy

Este documento estabelece as normas técnicas obrigatórias para o desenvolvimento do projeto Skillsy, com foco total na conformidade com o **Next.js 15+ (App Router)** e integração segura com **Firebase**.

## 1. Padrões de Arquitetura Next.js

### 1.1 Server Components por Padrão
- Todos os componentes devem ser **Server Components** a menos que exijam interatividade (hooks, eventos, APIs de navegador).
- O uso de `'use client'` deve ser limitado às "folhas" da árvore de componentes sempre que possível.

### 1.2 Busca de Dados (Data Fetching)
- **Preferência por Servidor**: Realizar buscas de dados públicos diretamente em Server Components (Pages ou Layouts).
- **Redução de Fetch Duplo**: Se os dados são necessários para Metadados e UI, busque-os no servidor uma única vez e passe para os sub-componentes.
- **Suspense**: Utilizar `Suspense` com fallbacks de Skeleton para carregamento progressivo de partes da página.

### 1.3 Mutações via Server Actions
- Operações de escrita (criar perfil, atualizar, avaliar) devem preferencialmente ser implementadas como **Server Actions**.
- Benefícios: Segurança, redução de código no bundle do cliente e suporte a Progressive Enhancement (formulários funcionando sem JS).

### 1.4 Formulários
- Utilizar o componente `<Form>` do Next.js 15 para buscas que alteram a URL via query parameters.

## 2. Integração com Firebase

### 2.1 Conflito Identificado: Auth Client-Side vs Server-Side
- **Contexto**: O SDK do Firebase (`firebase/auth`) mantém o estado de login no navegador. Server Components não têm acesso a `auth.currentUser`.
- **Regra**: 
  - Leituras de **dados públicos** podem ocorrer no servidor.
  - Leituras/Escritas de **dados privados** ou dependentes de Auth devem ocorrer no Cliente ou ser validadas via Server Actions (embora a validação de token do Firebase no servidor exija setup adicional de cookies de sessão).

### 2.2 Segurança
- Todas as operações devem respeitar as `firestore.rules`.
- Nunca expor chaves sensíveis (exceto a `NEXT_PUBLIC_GEMINI_API_KEY` conforme as instruções do sistema).

## 3. Experiência do Usuário (UX/Design)
- Seguir as diretrizes do `frontend-design`.
- Utilizar **Skeletons** consistentes para todos os estados de carregamento.
- Implementar **Optimistic Updates** para ações frequentes do usuário.

## 4. IA e Gemini
- Chamadas à API Gemini **DEVEM** ser feitas exclusivamente no lado do cliente (`'use client'`), conforme requisito da plataforma.

## 5. UI e Componentes (shadcn/ui)
- **Prioridade shadcn/ui**: O uso de componentes da biblioteca shadcn/ui em sua versão mais atual é prioritário.
- **Customização**: Criar componentes customizados apenas quando a biblioteca shadcn/ui não oferecer um componente adequado ou extensível para a funcionalidade necessária.
