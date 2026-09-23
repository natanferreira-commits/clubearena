# Clube Arena — Design System

Sistema visual do **Clube Arena**, produto de comunidade/gamificação da Arena (afiliação de casas de apostas) que transforma leads já cadastrados em membros que convidam amigos. Derivado das LPs desenhadas em `Clube Arena LPs.dc.html` (turno 2) a partir do PRD em `uploads/PRD-clube-arena.md`.

Fontes: PRD (Natan Puggian, 2026-09-23); referência visual enviada pelo usuário (print de LP de programa de fidelidade, estilo "fintech clean"; o laranja da referência foi trocado por verde limão). Não há logo — o wordmark é texto: **Clube Arena.** com ponto final verde. Não recriar marca da Arena aqui.

## Conteúdo (tom e linguagem)

- Sério, direto, sem gíria. Frases curtas. Você/seu. Sem emoji. ★ e ✓ como glifos de texto, não emoji.
- **Nunca usar** (regulatório, PRD §6.4): indicar, indicação, referral, afiliado, programa de afiliação, comissão, ganhar por conta nova, pagamento por lead.
- **Usar:** convidar, convite, clube, comunidade, membro, estrela, nível, recompensa do nível, prêmio do clube, casa parceira (a casa nunca aparece com marca).
- Sempre presentes: "18+", "Jogue com responsabilidade", "recompensas podem ser alteradas sem aviso", estrela "confirmada em até 3 dias".
- Exemplos: "Convide amigos. Conquiste estrelas. Suba de nível." · "Aceitar convite" · "Só WhatsApp e apelido. Sem custo."

## Fundamentos visuais

- **Fundo branco, neutros quentes.** Preto `#141414`, nunca `#000`. Cinzas puxados pro amarelo (`#6b6b66`, `#ececea`, `#f6f6f4`).
- **Uma cor: verde limão.** `#bfe83a` como superfície (CTA pill, texto sempre em `#141414`, nunca branco — contraste). `#4d7c0f` como tom de texto sobre branco: uma frase do título, ✓ de benefícios, ★ e ponto do wordmark. Nunca em fundo de seção, nunca em gradiente, nunca em dois botões na mesma tela.
- **Tipografia:** IBM Plex Sans, pesos 400/500/600. Display 34px/1.1/-0.02em. Sem condensadas, sem display fonts.
- **Sem sombra em cards.** A única sombra é a do CTA (`--shadow-cta`, verde translúcido). Profundidade vem de `--surface-subtle`.
- **Listas por hairline** (`--border-hairline`), não por cards. Passos numerados "01 02 03" em cinza. Tabela de níveis com linha de cabeçalho preta de 1px.
- **Raios por papel:** input 8, bloco 14, tela 20, botão pill.
- **Gamificação discreta:** estrelas como número + ★, níveis como texto. Sem barras coloridas, sem glow, sem fundos escuros.
- **Movimento:** praticamente nenhum. Hover de CTA escurece para `--brand-600`. Links: sublinhado, cor do texto.
- **Mobile 390 é a referência.** Gutter 24, seções separadas por 40.

## Iconografia

Sem set de ícones. Glifos unicode: ★ (estrela), ✓ (benefício), — (vazio), 18+ em caixa. Se um set for necessário no admin, usar Lucide via CDN (traço 1.5) e registrar aqui.

## Índice

- `styles.css` — entrada; só `@import`.
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` (espaço, raio, sombra, tamanhos) · `tokens/fonts.css`
- `guidelines/*.html` — cards de fundação (Colors, Type, Spacing, Patterns).
- `Clube Arena LPs.dc.html` — LPs de membro (2a) e convidado (2b), fonte dos tokens. Turno 1 (escuro) mantido só como histórico; não seguir.
- Componentes React e UI kit: ainda não criados.

## Próximos

- Componentes: Button, Input, Tag/Selo, LevelTable, StepList, Footer regulatório.
- Telas: painel do membro, ranking, admin (vai exigir fechar os tokens de feedback).
