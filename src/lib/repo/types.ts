export type Membro = {
  id: string;
  telefone: string;
  apelido: string;
  codigo: string;
  indicado_por: string | null;
  criado_em: string;
  ultimo_login: string | null;
  fingerprint: string | null;
  ip_cadastro: string | null;
  flag_fraude: string | null;
  tipo_pix: string | null;
  chave_pix: string | null;
  titular_pix: string | null;
  pix_atualizado_em: string | null;
};

export type Casa = {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  link_afiliado: string;
  bonus_amigo: string | null;
  cpa_valor: number | null;
  ativa: boolean;
  ordem: number;
};

export type StatusConversao = 'aguardando_comprovante' | 'pendente' | 'validada' | 'rejeitada' | 'paga';

export type Conversao = {
  id: string;
  convidado_id: string;
  indicador_id: string | null;
  casa_id: string | null;
  status: StatusConversao;
  comprovante_cadastro_url: string | null;
  comprovante_ftd_url: string | null;
  valor_ftd: number | null;
  motivo_rejeicao: string | null;
  criada_em: string;
  enviada_em: string | null;
  validada_em: string | null;
  validada_por: string | null;
  payout_id: string | null;
  lembrete_30_em: string | null;
  lembrete_24h_em: string | null;
};

export type Payout = {
  id: string;
  membro_id: string;
  mes: string;
  tipo: 'convites' | 'bonus';
  conversoes_ids: string[];
  valor: number;
  chave_pix: string | null;
  status: 'pendente' | 'pago' | 'recusado';
  criado_em: string;
  pago_em: string | null;
  pago_por: string | null;
};

export type Evento = {
  id: number;
  criado_em: string;
  membro_id: string | null;
  evento: string;
  meta: Record<string, unknown> | null;
};

export type Otp = { telefone: string; codigo_hash: string; expira_em: string; tentativas: number };

export type NovoMembro = Pick<Membro, 'telefone' | 'apelido' | 'codigo' | 'indicado_por' | 'fingerprint' | 'ip_cadastro' | 'flag_fraude'>;

export type FiltroConversoes = {
  indicadorId?: string;
  convidadoId?: string;
  status?: StatusConversao[];
  /** filtra por criada_em >= desde */
  desde?: Date;
  /** filtra validada_em em [de, ate) */
  validadaEntre?: [Date, Date];
};

export interface Repo {
  readonly modo: 'supabase' | 'demo';

  membroPorId(id: string): Promise<Membro | null>;
  membroPorTelefone(telefone: string): Promise<Membro | null>;
  membroPorCodigo(codigo: string): Promise<Membro | null>;
  membrosPorIds(ids: string[]): Promise<Membro[]>;
  criarMembro(m: NovoMembro): Promise<Membro>;
  atualizarMembro(id: string, dados: Partial<Membro>): Promise<void>;
  contarMembros(desde?: Date): Promise<number>;
  contarConvidadosDe(indicadorId: string): Promise<number>;
  convidadosDe(indicadorId: string, limite: number): Promise<Membro[]>;

  casas(somenteAtivas: boolean): Promise<Casa[]>;
  casaPorSlug(slug: string): Promise<Casa | null>;
  salvarCasa(c: Omit<Casa, 'id'> & { id?: string }): Promise<void>;

  conversaoPorId(id: string): Promise<Conversao | null>;
  conversoes(f: FiltroConversoes): Promise<Conversao[]>;
  criarConversao(c: Pick<Conversao, 'convidado_id' | 'indicador_id' | 'casa_id'>): Promise<Conversao>;
  atualizarConversao(id: string, dados: Partial<Conversao>): Promise<void>;

  payouts(membroId?: string): Promise<Payout[]>;
  criarPayout(p: Omit<Payout, 'id' | 'criado_em'>): Promise<Payout>;

  registrarEvento(e: { evento: string; membro_id?: string | null; meta?: Record<string, unknown> }): Promise<void>;
  contarEventos(evento: string, desde: Date): Promise<number>;

  salvarOtp(o: Otp): Promise<void>;
  otp(telefone: string): Promise<Otp | null>;
  apagarOtp(telefone: string): Promise<void>;

  /** Salva um print e devolve o caminho interno. */
  subirArquivo(caminho: string, dados: ArrayBuffer, contentType: string): Promise<string>;
  /** URL temporária para exibir o print no admin. */
  urlArquivo(caminho: string): Promise<string | null>;
}
