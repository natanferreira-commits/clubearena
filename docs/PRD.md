# PRD — Clube Arena

**Autor:** Natan Puggian
**Data:** 2026-09-23
**Versão:** 2 (revisada com fluxo real)
**Status:** Draft / discussão aberta

---

## 1. Contexto e problema

Toda campanha da Arena (bolão, disparo comercial, criativo Meta Ads, comunidade) recebe uma parcela de leads que **já têm conta na casa parceira**. Esses leads são CPA morto: consomem atenção do comercial, cliques na LP, mensagens no zap, mas não retornam receita direta (não geram FTD novo).

Adicionalmente, com o **PL 2.470 + MP das bets em tramitação (set/2026)**, publicidade explícita de "programa de indicação com PIX por FTD" ficou em zona regulatória delicada. A solução tem que ser embrulhada como **clube/comunidade**, evitando terminologia de MLM/afiliação/comissão.

## 2. Proposta de valor

**Clube Arena** — produto guarda-chuva que:

- Absorve leads "queimados" de qualquer campanha da Arena
- Transforma esses leads em canal de aquisição de NOVOS leads (via convite pra amigos sem conta)
- Recompensa o indicador com PIX por cada amigo que faz FTD
- Escala como marca própria da Arena, plugável em qualquer afiliado atual/futuro

## 3. Público-alvo

| Perfil | Quem é | O que faz no Clube |
|--------|--------|-------------------|
| **Indicador** | Lead com conta na casa | Cadastra no Clube, pega link único, convida amigos, recebe PIX |
| **Convidado** | Amigo sem conta na casa | Chega pelo link do indicador, escolhe casa no grid, cadastra e deposita, envia comprovante |
| **Espectador** | Visitante que só vê ranking / conteúdo | Consome, pode virar indicador ou convidado no futuro |

## 4. Mecânica principal

### 4.1 O ganho DIRETO pro indicador (carro-chefe)

> **Convide amigos. Cada amigo que fizer o primeiro depósito = R$ 50 no seu PIX.**

Simples, direto, matemática óbvia:
- 1 amigo = R$ 50
- 5 amigos = R$ 250
- 10 amigos = R$ 500

**Sem escadinha como mecânica principal.** O cara sabe exatamente o que ganha por cada convite convertido.

### 4.2 Bônus surpresa (retenção, não anunciado com destaque)

- Chegou em 10 amigos no mês? Bônus extra de R$ 200 no PIX
- Aparece discreto no painel do indicador ("🎯 Você tá a X convites do bônus surpresa")
- Não vira headline da comunicação — é dopamina extra pros mais engajados

### 4.3 Oferta pro convidado (2-lados converte 3-5x mais)

Cada casa do grid pode ter oferta própria (a definir com cada casa):
- **Bônus real na casa** (ex: R$ 20 grátis pra apostar) — depende do que a casa oferece
- **Acesso ao VIP** do afiliado por 30 dias — custo baixo pra Arena
- **Bilhete premium** no bolão da semana — reforça engajamento

**Regra:** cada casa no grid deve ter uma oferta clara pro convidado. Sem oferta, o card fica menos atraente.

## 5. Fluxo end-to-end (10 etapas)

```
ETAPA 1 — TRIGGER
Cara em qualquer campanha diz "já tenho conta"
→ recebe link do Clube Arena

ETAPA 2 — INDICADOR VIRA MEMBRO
Entra na LP → cadastra (apelido + telefone) → ganha link único
Ex: clubearena.com.br/c/JOAO7X

ETAPA 3 — INDICADOR COMPARTILHA
Botão "Compartilhar no WhatsApp" com copy pré-pronta

ETAPA 4 — AMIGO CAI NA LP DE CONVITE
"João te convidou pro Clube Arena"
Explicação: o que ganha + prova social

ETAPA 5 — AMIGO VIRA MEMBRO
Cadastra no Clube (mesmo form do indicador)
Sistema vincula: amigo_id + indicador_id

ETAPA 6 — AMIGO ESCOLHE CASA (grid)
Grid de N casas parceiras
Cada card: logo + oferta pro amigo + botão "Entrar"

ETAPA 7 — AMIGO CADASTRA + DEPOSITA NA CASA
(fora do nosso controle — na casa parceira)

ETAPA 8 — AMIGO VOLTA E ENVIA COMPROVANTE
Form no Clube pra upload de print (cadastro + FTD)
WhatsApp automático 30min depois: "Ei, já se cadastrou? Volta pra enviar o print"

ETAPA 9 — COMERCIAL VALIDA
Admin com fila de pendentes → confere print vs. dashboard da casa
→ aprova ou rejeita → SLA de 48h

ETAPA 10 — PIX PRO INDICADOR
Comercial pede chave PIX do indicador (via zap) → paga manual
→ marca no admin como pago → notifica indicador
```

## 6. Escopo do MVP

### ✅ Dentro do MVP

- Landing pública (`/`) com explicação + ranking
- Cadastro simples (`/entrar`) — apelido + telefone WhatsApp
- Tela de boas-vindas + geração de link pessoal
- Painel do membro (`/painel`)
- LP intermediária de convite (`/c/[codigo]`)
- Grid de casas parceiras (2-3 casas no início)
- Form de envio de comprovante (`/comprovante`)
- Ranking mensal público (`/ranking`)
- Admin com fila de validação + gestão de payouts
- Payout de PIX **manual** pelo admin
- WhatsApp automático de retorno (Z-API ou manual)

### ❌ Fora do MVP

- Postback S2S automático da casa (fica pra V2 se casa aceitar)
- Payout automatizado via API bancária
- App mobile
- Sistema de disputa/contestação
- OTP por SMS no cadastro (adiciona fricção — só se detectarmos fraude alta)
- Escadinha de níveis com badges/gamificação pesada
- Marketplace de prêmios não-financeiros
- Ranking histórico/permanente (por enquanto só mensal com reset)

## 7. Regras de negócio

### 7.1 Elegibilidade do PIX

Uma conversão SÓ paga PIX quando:
- Amigo enviou comprovante de cadastro + comprovante de FTD
- FTD do amigo ≥ R$ 30 (evita fraude com depósitos mínimos)
- Comercial validou manualmente contra dashboard da casa
- Passou hold de 3 dias sem cancelamento/chargeback

### 7.2 Anti-fraude

- 1 telefone WhatsApp = 1 membro (não permite duplicata)
- Convite não conta se o indicador clicar no próprio link (fingerprint + IP)
- Se detectar mesmo device (indicador + convidado), invalida
- Comercial pode flagar comprovantes suspeitos (print editado, valor errado, etc)
- Cap: máximo 10 PIXes/mês por indicador no MVP (avalia expansão depois)

### 7.3 Reset mensal do ranking

- Dia 1 às 00h BRT: estrelas do mês passam pra histórico permanente (badge), contador zera
- Membro mantém badge "Diamante em X meses" (proof social sem carregar contador eterno)

### 7.4 Linguagem regulatória (importante!)

**❌ NUNCA usar** (site, comunicação, admin):
- "Indicar", "indicação", "referral"
- "Programa de afiliação"
- "Comissão", "commission"
- "Ganhar por conta nova"
- "Pagamento por lead"

**✅ Sempre substituir por:**
- "Convidar", "convite"
- "Clube", "comunidade"
- "Recompensa do clube", "prêmio"
- "Conquistar estrelas"
- "Reconhecimento de membro ativo"

## 8. Arquitetura técnica

### 8.1 Stack (reuso do que já tem)

- **Frontend:** Next.js 15 (App Router) — mesma stack do bolão
- **Hosting:** Vercel
- **Backend:** Supabase (PostgreSQL + REST + RLS)
- **Domínio:** [a definir por Natan]
- **Automação zap:** Z-API (mensagem de retorno pro amigo)
- **Storage de comprovantes:** Supabase Storage

### 8.2 Schema Supabase

```sql
-- Membros do Clube (indicadores + convidados que viram membros)
create table clube_membros (
  id            uuid primary key default gen_random_uuid(),
  telefone      text unique not null,
  apelido       text not null,
  codigo        text unique not null,             -- ex: JOAO7X
  indicado_por  uuid references clube_membros(id),-- null se veio direto
  criado_em     timestamptz default now(),
  ultimo_login  timestamptz,
  fingerprint   text,                              -- pra detectar auto-indicação
  ip_cadastro   text
);

-- Casas parceiras (config no admin)
create table clube_casas (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  slug          text unique not null,             -- 'esportivabet'
  logo_url      text,
  link_afiliado text not null,                    -- link base pra cadastro
  bonus_amigo   text,                             -- descrição do bônus
  cpa_valor     numeric,                          -- pra referência interna
  ativa         boolean default true,
  ordem         int default 0
);

-- Conversões (amigo escolheu casa + enviou comprovante)
create table clube_conversoes (
  id                uuid primary key default gen_random_uuid(),
  convidado_id      uuid references clube_membros(id),
  indicador_id      uuid references clube_membros(id),
  casa_id           uuid references clube_casas(id),
  status            text default 'pendente',     -- pendente | validada | rejeitada
  comprovante_url   text,                        -- print do cadastro + FTD
  valor_ftd         numeric,
  motivo_rejeicao   text,
  enviada_em        timestamptz default now(),
  validada_em       timestamptz,
  validada_por      text                         -- email do admin
);

-- Payouts de PIX
create table clube_payouts (
  id             uuid primary key default gen_random_uuid(),
  membro_id      uuid references clube_membros(id),
  mes            text not null,                  -- '2026-09'
  conversoes_ids uuid[],                         -- referências das conversões pagas
  valor          numeric not null,
  chave_pix      text,
  status         text default 'pendente',        -- pendente | pago | recusado
  pago_em        timestamptz,
  pago_por       text
);

-- Eventos (funil, tracking)
create table clube_eventos (
  id            bigserial primary key,
  criado_em     timestamptz default now(),
  membro_id     uuid,
  evento        text,                            -- page_view | cadastro | compartilhou | convite_click | escolheu_casa | comprovante_enviado
  meta          jsonb
);
```

## 9. Telas necessárias (pro Claude Design)

### 🌐 Fluxo público

**Tela 1 — Landing (`/`)**
- Hero: "Clube Arena" + tagline ("Convide amigos, ganhe R$ 50 por cadastro que virar depósito")
- Como funciona (3 passos: cadastrar → convidar → ganhar)
- Ranking do mês (top 5) — prova social
- CTA principal: "Entrar no Clube"
- Footer + compliance

**Tela 2 — Cadastro (`/entrar`)**
- Form minimalista: apelido + telefone WhatsApp
- Botão: "Entrar no Clube"
- Link secundário: "Já sou membro" → login por telefone

**Tela 3 — Boas-vindas / Painel inicial (`/bem-vindo`)**
- Header: "Bem-vindo ao Clube, {apelido}!"
- Card grande: teu link pessoal com botão "Copiar"
- CTA principal: **"Compartilhar no WhatsApp"** (abre wa.me com msg pronta)
- Explicação rápida: "Cada amigo que se cadastrar e depositar = R$ 50 no teu PIX"
- Link secundário: "Ir pro meu painel"

**Tela 4 — Painel do membro (`/painel`)**
- Header: apelido + código do membro
- Card destaque: "Você tem R$ X pendente + R$ Y disponível"
- Estatísticas: convites enviados, cadastros confirmados, PIXes recebidos
- Barra sutil: "🎯 X convites pro bônus surpresa" (não é destaque principal)
- Link pessoal + botão copiar + botão compartilhar
- Lista: últimos 5 convites (status: aguardando cadastro / aguardando comprovante / validado / pago)
- Link: "Ver ranking do mês"

**Tela 5 — Ranking (`/ranking`)**
- Top 20 do mês (apelido + convites validados)
- Filtro: "Este mês / mês anterior"
- Badges dos meses anteriores em quem tem histórico

### 🤝 Fluxo do convidado

**Tela 6 — LP de convite (`/c/[codigo]`)** ⭐ crítica
- Header: "{Apelido do indicador} te convidou pro Clube Arena"
- Avatar/inicial do indicador
- Prova social: "Já 342 pessoas entraram esse mês"
- Oferta clara pro convidado: "Cadastra numa das casas parceiras + faz seu primeiro depósito e ganha [bônus definido]"
- CTA: "Entrar no Clube" (vai pra tela 7)
- Discreto: "Não conheço o {apelido}, quero entrar sozinho" → tela 2

**Tela 7 — Cadastro do amigo (`/c/[codigo]/entrar`)**
- Reforço: "Você foi convidado por {apelido}"
- Mesmo form da tela 2 (apelido + telefone)
- Sistema salva vínculo com indicador

**Tela 8 — Grid de casas (`/c/[codigo]/casas`)** ⭐ crítica
- Header: "Escolhe onde vai criar tua conta"
- Grid de N cards (2-3 no MVP):
  ```
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ [logo]      │  │ [logo]      │  │ [logo]      │
  │ CASA A      │  │ CASA B      │  │ CASA C      │
  │             │  │             │  │             │
  │ Bônus:      │  │ Bônus:      │  │ Bônus:      │
  │ R$ 20 grátis│  │ VIP 30 dias │  │ Bilhete free│
  │             │  │             │  │             │
  │ [ENTRAR]    │  │ [ENTRAR]    │  │ [ENTRAR]    │
  └─────────────┘  └─────────────┘  └─────────────┘
  ```
- Nota discreta: "Vai abrir em nova aba. Volta aqui depois pra enviar o comprovante"

**Tela 9 — Aguardando cadastro (`/c/[codigo]/aguardando`)**
- Header: "Perfeito! Agora vai lá fazer teu cadastro"
- 3 passos numerados:
  1. Criar conta na casa (tirar print da confirmação)
  2. Fazer depósito de pelo menos R$ 30 (tirar print do comprovante)
  3. Voltar aqui e enviar os prints
- CTA: "Já cadastrei, quero enviar os prints" → tela 10

**Tela 10 — Envio de comprovante (`/comprovante`)**
- Header: "Envia os prints pra {apelido do indicador} receber o PIX"
- Upload 1: print do cadastro (nome + email)
- Upload 2: print do FTD (valor + data)
- Campo opcional: valor depositado
- Botão: "Enviar comprovantes"
- Nota: "Validação em até 48h. Você receberá confirmação no WhatsApp."

**Tela 11 — Confirmação (`/comprovante/enviado`)**
- Ilustração de sucesso
- "Comprovante recebido. Vamos validar em até 48h"
- CTA: "Convidar outro amigo" (leva pro painel dele — sim, ele agora vira indicador)

### 🔒 Fluxo admin

**Tela 12 — Login admin (`/admin`)**
- Form: senha
- (mesma abordagem do bolão)

**Tela 13 — Dashboard admin (`/admin/dashboard`)**
- Métricas: total de membros, convites do mês, conversões validadas, PIX pendente
- Gráfico de conversões por dia
- Atalhos: fila de comprovantes / gestão de payouts

**Tela 14 — Fila de validação (`/admin/comprovantes`)** ⭐ crítica
- Lista de comprovantes pendentes
- Cada linha: convidado, indicador, casa escolhida, prints (thumbnails), botões [Validar] / [Rejeitar]
- Ao clicar num item, abre modal com prints ampliados + botões
- Se rejeitar, campo pra motivo

**Tela 15 — Gestão de payouts (`/admin/payouts`)**
- Lista de indicadores com PIX pendente
- Cada linha: apelido, telefone, valor total, botão "Marcar como pago"
- Ao marcar pago, sistema pede chave PIX (se ainda não coletou) e libera

**Tela 16 — Gestão de casas (`/admin/casas`)**
- CRUD de casas parceiras
- Campos: nome, logo, link afiliado, bônus pro amigo, CPA, ativa (sim/não)

### 🎨 Componentes reutilizáveis (pra o design system)

- **Botão CTA principal** (grande, destaque)
- **Botão CTA secundário** (outline)
- **Card de casa** (logo + bônus + CTA)
- **Card de membro** (apelido + status + valor)
- **Ranking row** (posição + apelido + convites + badge)
- **Empty state** (sem convites, sem comprovantes, etc)
- **Toast/notificação** (sucesso, erro, info)
- **Input** (padrão + estados: focus, error, disabled)
- **Upload de arquivo** (com preview de imagem)
- **Modal** (validação de comprovante, confirmação de payout)
- **Badge de nível** (bronze/prata/ouro/diamante — mesmo sem escadinha principal, ajuda no ranking)

## 10. Métricas de sucesso

### Primárias (mês 1)
- **Taxa "lead queimado → membro":** meta 30%
- **Taxa "membro → primeiro convite enviado":** meta 40%
- **Taxa "convite clicado → cadastro do amigo":** meta 25%
- **Taxa "cadastro do amigo → comprovante enviado":** meta 20%
- **Taxa "comprovante enviado → aprovado":** meta 80%

### Financeiras
- Custo por FTD via Clube Arena ≤ 60% do CPA de tráfego pago
- Tempo médio comprovante enviado → PIX pago ≤ 48h

## 11. Riscos e mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Fraude massiva (prints editados) | 🔴 Alto | Validação manual + fingerprint + IP + cross-check com dashboard da casa |
| Enquadramento como MLM | 🔴 Alto | Linguagem "clube" + só 1 nível (não multi-nível) + termos legais claros |
| Casa não confirma FTD ou tem regra que invalida | 🟡 Médio | Termos claros: PIX só após validação com dashboard da casa |
| Comercial não valida em 48h | 🟡 Médio | SLA visível no site + alerta interno se pendente há > 24h |
| Volume de comprovantes explode | 🟡 Médio | Cap inicial de 10 payouts/mês por indicador + queue priorizada |
| Amigo não volta pra enviar comprovante | 🔴 Alto | WhatsApp automático 30min depois + reforço 24h depois |
| Payout manual não escala | 🟢 Baixo | Automatizar só quando > 20 payouts/mês |

## 12. Cronograma proposto (MVP)

| Sprint | Duração | Entrega |
|--------|---------|---------|
| **S1** | 1 semana | Casa parceira definida + link/tracking funcionando + Supabase schema criado + domínio configurado |
| **S2** | 1 semana | Landing pública + cadastro + geração de link + tela de boas-vindas |
| **S3** | 1 semana | LP de convite + cadastro do amigo + grid de casas + tela de aguardando |
| **S4** | 1 semana | Envio de comprovante + admin básico + fila de validação |
| **S5** | 1 semana | Painel do membro + ranking mensal + gestão de payouts |
| **S6** | 1 semana | Piloto com 50 pessoas + ajustes + WhatsApp automático |
| **Total** | 6 semanas | MVP funcional em produção |

## 13. Decisões em aberto (destravar antes de S1)

- [ ] **Lista de casas parceiras** — quais entram no grid do MVP? (2-3 casas)
- [ ] **CPA de cada casa** — pra dimensionar o PIX pro indicador
- [ ] **Bônus pro amigo em cada casa** — o que a casa aceita dar?
- [ ] **Domínio comprado** — qual URL?
- [ ] **Valor do PIX por indicação** — R$ 50 padrão ou varia por casa?
- [ ] **Valor do bônus surpresa** — R$ 200 a cada 10 convites? Outra estrutura?
- [ ] **Quem valida comprovantes** — Natan? Comercial? Alguém dedicado?
- [ ] **SLA de validação** — 48h ou menos?
- [ ] **Z-API vs manual** — WhatsApp de retorno pro amigo é automático ou manual?
- [ ] **Design system final** — cores, tipografia, tom da marca (a definir no Claude Design)

## 14. Fora deste PRD (backlog futuro)

- Postback S2S automático (V2, se casa aceitar)
- Payout automatizado via API bancária
- Múltiplas casas com CPA dinâmico por casa
- App mobile / PWA
- Sistema de disputa formal entre membros
- Marketplace de prêmios não-financeiros (camisa, ingresso, etc)
- Notificações push
- Integração com CRM da Arena
- Programa de "afiliados premium" (níveis vitalícios)

---

**Próximo passo:** responder as decisões do item 13 pra começar S1.
