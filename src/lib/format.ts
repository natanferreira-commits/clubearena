const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const TZ = 'America/Sao_Paulo';

export function brl(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0 });
}

/** 'YYYY-MM' no fuso de Brasília. */
export function mesChave(d: Date = new Date()): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).formatToParts(d);
  return `${p.find((x) => x.type === 'year')!.value}-${p.find((x) => x.type === 'month')!.value}`;
}

export function nomeMes(chave: string): string {
  return MESES[Number(chave.split('-')[1]) - 1];
}

/** Intervalo UTC [início, fim) do mês BRT (BRT = UTC-3, sem horário de verão). */
export function intervaloMes(chave: string): [Date, Date] {
  const [y, m] = chave.split('-').map(Number);
  return [new Date(Date.UTC(y, m - 1, 1, 3)), new Date(Date.UTC(y, m, 1, 3))];
}

export function dataCurta(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit' });
}

export function dataHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function horasDesde(iso: string | null | undefined): number {
  if (!iso) return 0;
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

export function iniciais(apelido: string): string {
  return apelido.replace(/[^A-Za-zÀ-ú0-9]/g, '').slice(0, 2).toUpperCase() || '—';
}

/** Telefone: só dígitos, sempre com 55. Retorna null se não parecer celular BR. */
export function normalizarTelefone(v: string): string | null {
  let d = v.replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  if (d.length < 10 || d.length > 11) return null;
  return '55' + d;
}

export function formatarTelefone(tel: string): string {
  const d = tel.startsWith('55') ? tel.slice(2) : tel;
  return `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}`;
}

export function mascararPix(tipo: string | null, chave: string | null): string {
  if (!chave) return 'Não informada';
  const rotulo = { cpf: 'CPF', celular: 'Celular', email: 'E-mail', aleatoria: 'Aleatória' }[tipo ?? ''] ?? 'Chave';
  if (tipo === 'email') {
    const [a, b] = chave.split('@');
    return `${rotulo} ${a.slice(0, 2)}•••@${b ?? ''}`;
  }
  return `${rotulo} •••${chave.replace(/\s/g, '').slice(-4)}`;
}

export const APELIDO_RE = /^[a-zA-Z0-9_.]{3,14}$/;

/** Só aceita caminhos internos em ?next= (evita redirecionar para outro site). */
export function destinoSeguro(next: string | undefined, padrao: string): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : padrao;
}
