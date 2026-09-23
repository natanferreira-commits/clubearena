# Clube Arena

Clube de membros da Arena: quem já tem conta na casa parceira convida amigos que ainda não têm, e recebe **R$ 30 no PIX** por amigo com primeiro depósito validado. Implementação do MVP descrito no PRD (v2, 2026-09-23), com o visual do handoff do Claude Design (IBM Plex Sans, fundo branco, verde limão).

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Storage) · Z-API (WhatsApp) · Vercel.

## Rodar local

```bash
npm install
npm run dev
```

Sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` o app sobe em **modo demonstração**: dados de exemplo em memória (membros, casas Alfa/Beta/Gama, fila com 3 comprovantes). Admin em `/admin`, senha `arena` (só vale no modo demonstração).

## Colocar no ar

1. Criar projeto no Supabase e rodar `supabase/migrations/0001_clube_arena.sql` no SQL Editor (cria tabelas, RLS e o bucket privado `comprovantes`). **Antes do primeiro deploy.**
2. Na Vercel, importar o repo e configurar as variáveis de `.env.example` (no mínimo `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`).
3. Cadastrar as casas parceiras em `/admin/casas` (nome, link de cadastro com tracking, oferta para o convidado).
4. Lembretes de WhatsApp: o GitHub Actions (`.github/workflows/lembretes.yml`) chama `/api/cron/lembretes` a cada 15 min. Basta criar os secrets `SITE_URL` e `CRON_SECRET` no repositório (Settings → Secrets and variables → Actions). O cron da Vercel no plano Hobby só roda 1×/dia, por isso o GitHub.

## Telas

| Rota | O que é |
|---|---|
| `/` | Landing: como funciona, quanto vale, regras |
| `/entrar` | Cadastro (WhatsApp + apelido → chave PIX opcional). `?modo=login` entra com o WhatsApp |
| `/bem-vindo` | Link pessoal, copiar, compartilhar no WhatsApp |
| `/painel` | Em análise × disponível, estatísticas, bônus surpresa, últimos 5 convites, chave PIX |
| `/c/[codigo]` | LP do convite (o que o amigo vê) |
| `/c/[codigo]/entrar` | Cadastro do amigo, vinculado a quem convidou |
| `/c/[codigo]/casas` | Grid de casas com oferta de boas-vindas → `/ir/[slug]` registra e redireciona |
| `/c/[codigo]/aguardando` | Passo a passo até voltar com os prints |
| `/comprovante` | Upload dos 2 prints (comprimidos no navegador) + valor |
| `/admin/dashboard` | Membros, cliques, confirmados, fila, PIX a pagar, gráfico de 30 dias |
| `/admin/comprovantes` | Fila de validação com prints ampliados, validar/rejeitar com motivo |
| `/admin/payouts` | Quem tem PIX liberado, marcar como pago (pede a chave se faltar) |
| `/admin/casas` | CRUD das casas parceiras |

## Regras de negócio

Tudo em `src/lib/config.ts`: R$ 30 por amigo, bônus surpresa de R$ 200 ao chegar em 10 no mês, limite de 10 recompensas/mês, primeiro depósito mínimo de R$ 30, 3 dias de análise após a validação, SLA de 48 h.

Ciclo de uma conversão: `aguardando_comprovante` (amigo escolheu a casa) → `pendente` (enviou os prints) → `validada` / `rejeitada` → `paga` (entrou num PIX). O bônus surpresa e o limite do mês usam `validada_em`, no fuso de Brasília.

**Antifraude do MVP:** 1 WhatsApp = 1 membro; visitas ao próprio convite não contam; cadastro de amigo feito do mesmo aparelho (cookie) ou IP de quem convidou aparece com ⚠ na fila; valor abaixo do mínimo bloqueia a validação; chave PIX alterada nos últimos 7 dias aparece em alerta no pagamento.

**Linguagem regulatória (PRD §7.4):** `npm run check:linguagem` barra "indicar", "comissão", "afiliado", "referral" etc. nos textos das telas.

## Diferenças em relação ao handoff de design

O design foi desenhado com estrelas, níveis e ranking. Seguimos o PRD v2 com recompensa direta por amigo, e o ranking foi removido. Também:

- **Sem código por WhatsApp (OTP) no cadastro.** O fluxo está pronto: basta `OTP_ATIVO=true` com a Z-API configurada.
- **Chave PIX opcional** no cadastro ("Informar depois").
- **Casas aparecem com marca**, logo e oferta, no grid do convidado.
- Inputs em 16 px (o design pede 15) para o iPhone não dar zoom ao focar.

## Pendências (PRD §13)

- Casas parceiras reais, ofertas para o convidado e domínio.
- Credenciais da Z-API, senão as mensagens só vão para o log.
- O login só com o WhatsApp é fraco: quem souber o número de alguém vê o painel dessa pessoa e pode trocar a chave PIX. Enquanto o OTP estiver desligado, a mitigação é o alerta de chave recente e a conferência do titular antes de pagar.
