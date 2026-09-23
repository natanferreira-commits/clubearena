import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';

const COOKIE_MEMBRO = 'ca_sess';
const COOKIE_ADMIN = 'ca_admin';
export const COOKIE_DISPOSITIVO = 'ca_dev';

function segredo(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production' && process.env.SUPABASE_URL) {
    throw new Error('SESSION_SECRET não configurado');
  }
  return s || 'dev-secret-clube-arena';
}

function assinar(valor: string): string {
  const mac = createHmac('sha256', segredo()).update(valor).digest('base64url');
  return `${valor}.${mac}`;
}

function verificar(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i < 1) return null;
  const valor = token.slice(0, i);
  const esperado = Buffer.from(assinar(valor));
  const recebido = Buffer.from(token);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido) ? valor : null;
}

const opcoes = (dias: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: dias * 86_400,
});

export async function membroLogadoId(): Promise<string | null> {
  return verificar((await cookies()).get(COOKIE_MEMBRO)?.value);
}

export async function logarMembro(id: string) {
  (await cookies()).set(COOKIE_MEMBRO, assinar(id), opcoes(180));
}

export async function deslogarMembro() {
  (await cookies()).delete(COOKIE_MEMBRO);
}

/** Nome de quem está logado no admin (vai para validada_por / pago_por), ou null. */
export async function adminLogado(): Promise<string | null> {
  const v = verificar((await cookies()).get(COOKIE_ADMIN)?.value);
  if (!v) return null;
  const [, exp, nome] = v.split(':');
  return Number(exp) > Date.now() ? decodeURIComponent(nome || 'admin') : null;
}

export async function logarAdmin(nome: string) {
  (await cookies()).set(COOKIE_ADMIN, assinar(`admin:${Date.now() + 7 * 86_400_000}:${encodeURIComponent(nome)}`), opcoes(7));
}

export async function deslogarAdmin() {
  (await cookies()).delete(COOKIE_ADMIN);
}

export function senhaAdminConfere(senha: string): boolean {
  const certa = process.env.ADMIN_PASSWORD || (process.env.SUPABASE_URL ? '' : 'arena');
  if (!certa) return false;
  const a = Buffer.from(createHmac('sha256', 'x').update(senha).digest());
  const b = Buffer.from(createHmac('sha256', 'x').update(certa).digest());
  return timingSafeEqual(a, b);
}

/** Dispositivo (cookie setado no middleware) e IP — pra detectar auto-convite. */
export async function metaRequisicao(): Promise<{ fingerprint: string | null; ip: string | null }> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null;
  return { fingerprint: (await cookies()).get(COOKIE_DISPOSITIVO)?.value ?? null, ip };
}
