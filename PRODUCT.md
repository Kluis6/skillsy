# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Skillsy atende membros da comunidade que querem encontrar ajuda confiável, divulgar talentos, oferecer serviços, criar reputação e manter uma rede de contatos útil.

Os usuários chegam com necessidades práticas: contratar alguém, indicar um profissional, apresentar seu trabalho, avaliar uma experiência, compartilhar um perfil, criar um pedido de ajuda/orçamento, responder oportunidades ou administrar conteúdo e usuários.

O contexto de uso é cotidiano e frequentemente rápido: celular, WhatsApp, indicações pessoais, busca por cidade/categoria e decisão baseada em confiança. A interface deve ajudar a pessoa a entender quem é o membro, o que ele oferece, onde atua, quais sinais de confiança existem e qual próximo contato possível.

## Product Purpose

Skillsy existe para aproximar necessidades reais de talentos reais dentro de uma rede comunitária.

O produto funciona como um diretório e mural de conexões com perfis públicos, busca por profissionais, contatos salvos, recomendações comunitárias, avaliações, publicações, vagas, pedidos de ajuda/orçamento e ferramentas administrativas.

Sucesso significa que uma pessoa consegue encontrar alguém relevante, avaliar contexto suficiente para confiar, entrar em contato sem atrito e compartilhar perfis, publicações ou pedidos com uma prévia clara. Para quem oferece serviços, sucesso significa ter uma presença pública digna, completa e compartilhável, com sinais de reputação e informações de contato bem organizadas.

Skillsy não substitui a responsabilidade de avaliar, combinar valores ou fechar acordos. A plataforma facilita conexões com mais contexto; a decisão final continua entre as pessoas.

## Positioning

Skillsy se posiciona como uma rede comunitária de confiança para encontrar ajuda, profissionais e oportunidades por contexto real: perfil, categoria, localização, recomendações, avaliações e contato direto.

O diferencial não é intermediar pagamento ou prometer certificação técnica. O mecanismo central é tornar a reputação comunitária e o contexto local visíveis antes do contato, para que a pessoa decida com mais segurança.

Produtos vizinhos poderiam listar profissionais ou vagas, mas Skillsy deve preservar a lógica de rede: pessoas reais, sinais de confiança próximos da decisão e caminhos simples para buscar, pedir ajuda ou responder oportunidades.

## Operating Context

As principais jornadas do produto são:

- buscar profissionais por termo, categoria e localização;
- abrir um perfil público para avaliar bio, categoria, localização pública, disponibilidade, avaliação, recomendações e canais de contato;
- falar diretamente por WhatsApp quando houver contexto suficiente;
- publicar pedidos de ajuda/orçamento classificados por tipo de serviço e localização;
- alertar profissionais compatíveis com categoria e área geográfica sobre pedidos relevantes;
- acompanhar pedidos ativos e permitir que o criador encerre ou reative a exibição;
- recomendar, avaliar e comentar perfis sem associar necessariamente a um trabalho formal dentro da plataforma;
- administrar usuários, publicações e fila de moderação.

O uso esperado é majoritariamente web/mobile, com WhatsApp como canal externo importante. A experiência deve ser rápida, legível e confortável para decisões em deslocamento ou em conversas cotidianas.

## Capabilities and Constraints

Capacidades confirmadas:

- perfis públicos de membros e profissionais;
- busca pública por profissionais;
- categorias de serviço compartilhadas entre perfil, busca e pedidos;
- localização pública controlada por cidade, estado e/ou bairro conforme a superfície;
- recomendações comunitárias identificadas;
- avaliações e comentários identificados;
- mural de oportunidades/pedidos de ajuda;
- alertas internos para profissionais compatíveis com pedido, categoria e localização;
- contato direto por WhatsApp com mensagem contextual;
- painel administrativo para usuários, publicações e moderação;
- Firebase como base de autenticação, dados e regras de segurança.

Restrições e limites do produto:

- Skillsy não certifica tecnicamente profissionais;
- Skillsy não intermedeia pagamentos;
- Skillsy não substitui contratos, orçamentos, combinações ou avaliação pessoal entre usuários;
- dados religiosos e localização sensível devem ser tratados com restrição e minimização;
- informações críticas não devem depender apenas de cor, hover, imagem ou texto pequeno;
- chamadas ao Gemini, quando existirem, seguem a restrição do projeto de execução no cliente.

Decisões abertas:

- o nível exato de granularidade geográfica para matching de oportunidades além de cidade/estado/bairro;
- a política final de destaque, ordenação e expiração de pedidos urgentes;
- quais sinais entram em “conexões em comum” quando essa ideia for implementada.

## Brand Commitments

Skillsy deve soar humano, confiável e prático.

A voz é direta, acolhedora e responsável. Evita exageros promocionais, promessas absolutas e linguagem de marketplace impessoal. A marca fala como uma rede de apoio organizada: mostra contexto, explica limites, orienta próximos passos e valoriza reputação construída por experiência real.

Emocionalmente, a experiência deve transmitir calma, clareza e pertencimento. O usuário deve sentir que está vendo pessoas reais e oportunidades reais, não uma vitrine genérica.

Skillsy não deve parecer:

- um marketplace frio, focado apenas em conversão e catálogo;
- uma rede social ruidosa, com engajamento como objetivo principal;
- uma plataforma que promete certificar tecnicamente profissionais ou intermediar pagamentos;
- uma página institucional feita de slogans sem prova concreta de pessoas, serviços, localização, contato e reputação.

## Evidence on Hand

Evidências e ativos reais presentes no projeto:

- rotas públicas para busca, oportunidades, encontrar ajuda, publicações, perfis, privacidade e termos;
- componentes de perfil, busca, oportunidades, notificações e painel administrativo;
- `DESIGN.md` com design system atual do Skillsy;
- `.impeccable/design.json` sincronizado com o design system;
- `firestore.rules` e serviços Firebase para dados do produto;
- textos e metadados públicos em português do Brasil.

Ausências que trabalhos futuros não devem fabricar:

- não há prova externa confirmada de certificação profissional;
- não há política confirmada de garantia de serviço;
- não há depoimentos, números de tração, receita ou volume de usuários confirmados neste documento.

## Product Principles

1. **Confiança antes do contato.** Mostre reputação, localização, categoria, disponibilidade e contexto perto das decisões de conversar, compartilhar, conectar ou indicar.

2. **Pessoas reais antes de catálogo.** Perfis, nomes, fotos, empresas, bairros, categorias, avaliações e bio carregam a identidade do produto mais do que uma listagem genérica.

3. **A plataforma facilita, não promete demais.** Copy, fluxos e moderação devem deixar claro que Skillsy cria contexto e conexão, mas a decisão final continua entre as pessoas.

4. **Um sistema, vários caminhos claros.** Buscar profissional, pedir ajuda e ver pedidos abertos devem parecer partes de uma mesma rede, não produtos separados.

5. **Controle para quem publica.** Quem cria um pedido deve entender quem pode vê-lo, quando ele expira e como encerrar ou reativar a exibição.

## Accessibility & Inclusion

Skillsy deve mirar acessibilidade WCAG AA para contraste, foco visível, navegação por teclado e textos legíveis.

Estados de carregamento devem usar skeletons coerentes com a rota. Estados vazios devem orientar a próxima ação. Erros, limites de formulário e avisos legais devem ser escritos em linguagem simples, com texto de pelo menos 12px e contraste suficiente.

Como muitos usuários podem acessar pelo celular, a experiência mobile deve priorizar toque confortável, leitura clara, filtros simples, contato direto e compartilhamento. Movimento deve ser discreto, respeitar redução de movimento e nunca bloquear acesso ao conteúdo.
