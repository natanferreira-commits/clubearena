-- Clube Arena — schema inicial (PRD §8.2, com os campos que o fluxo real pediu)
-- Rodar no SQL Editor do Supabase ANTES do primeiro deploy.
-- Todo acesso é feito pelo servidor com a service role; RLS ligado e sem policies
-- bloqueia qualquer leitura/escrita com a chave anon.

create extension if not exists pgcrypto;

-- Membros do clube (quem convida e quem foi convidado — todo mundo é membro)
create table if not exists clube_membros (
  id                uuid primary key default gen_random_uuid(),
  telefone          text unique not null,              -- só dígitos, com 55
  apelido           text not null,
  codigo            text unique not null,              -- ex: JOAO7X
  indicado_por      uuid references clube_membros(id), -- membro que convidou; null se veio direto
  criado_em         timestamptz not null default now(),
  ultimo_login      timestamptz,
  fingerprint       text,                              -- cookie de dispositivo
  ip_cadastro       text,
  flag_fraude       text,                              -- motivo, se o cadastro parecer auto-convite
  tipo_pix          text,                              -- cpf | celular | email | aleatoria
  chave_pix         text,
  titular_pix       text,
  pix_atualizado_em timestamptz
);
create index if not exists clube_membros_indicado_por_idx on clube_membros(indicado_por);

-- Casas parceiras (gerenciadas em /admin/casas)
create table if not exists clube_casas (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  slug          text unique not null,
  logo_url      text,
  link_afiliado text not null,                         -- link de cadastro com tracking
  bonus_amigo   text,                                  -- oferta mostrada ao convidado
  cpa_valor     numeric,                               -- referência interna
  ativa         boolean not null default true,
  ordem         int not null default 0
);

-- Conversões: nasce quando o convidado escolhe a casa, anda até ser paga.
-- status: aguardando_comprovante | pendente | validada | rejeitada | paga
create table if not exists clube_conversoes (
  id                       uuid primary key default gen_random_uuid(),
  convidado_id             uuid not null references clube_membros(id),
  indicador_id             uuid references clube_membros(id),
  casa_id                  uuid references clube_casas(id),
  status                   text not null default 'aguardando_comprovante',
  comprovante_cadastro_url text,                       -- caminho no bucket "comprovantes"
  comprovante_ftd_url      text,
  valor_ftd                numeric,
  motivo_rejeicao          text,
  criada_em                timestamptz not null default now(),
  enviada_em               timestamptz,
  validada_em              timestamptz,
  validada_por             text,
  payout_id                uuid,
  lembrete_30_em           timestamptz,
  lembrete_24h_em          timestamptz
);
create index if not exists clube_conversoes_indicador_idx on clube_conversoes(indicador_id);
create index if not exists clube_conversoes_convidado_idx on clube_conversoes(convidado_id);
create index if not exists clube_conversoes_status_idx on clube_conversoes(status);

-- PIX pagos (manual, registrado pelo admin)
-- tipo: convites | bonus
create table if not exists clube_payouts (
  id             uuid primary key default gen_random_uuid(),
  membro_id      uuid not null references clube_membros(id),
  mes            text not null,                        -- '2026-09'
  tipo           text not null default 'convites',
  conversoes_ids uuid[] not null default '{}',
  valor          numeric not null,
  chave_pix      text,
  status         text not null default 'pago',         -- pendente | pago | recusado
  criado_em      timestamptz not null default now(),
  pago_em        timestamptz,
  pago_por       text
);
create index if not exists clube_payouts_membro_idx on clube_payouts(membro_id);

alter table clube_conversoes
  drop constraint if exists clube_conversoes_payout_fk,
  add constraint clube_conversoes_payout_fk foreign key (payout_id) references clube_payouts(id);

-- Eventos de funil
create table if not exists clube_eventos (
  id         bigserial primary key,
  criado_em  timestamptz not null default now(),
  membro_id  uuid,
  evento     text not null,  -- page_view | cadastro | compartilhou | convite_click | escolheu_casa | comprovante_enviado
  meta       jsonb
);
create index if not exists clube_eventos_evento_idx on clube_eventos(evento, criado_em);

-- Códigos de confirmação por WhatsApp (só usado com OTP_ATIVO=true)
create table if not exists clube_otp (
  telefone    text primary key,
  codigo_hash text not null,
  expira_em   timestamptz not null,
  tentativas  int not null default 0
);

alter table clube_membros    enable row level security;
alter table clube_casas      enable row level security;
alter table clube_conversoes enable row level security;
alter table clube_payouts    enable row level security;
alter table clube_eventos    enable row level security;
alter table clube_otp        enable row level security;

-- Bucket privado para os prints (visualizados no admin por URL assinada)
insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;
