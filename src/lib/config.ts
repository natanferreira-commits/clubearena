// Regras de negócio do clube (PRD §4 e §7). Mudou uma regra? Muda aqui.
export const REGRAS = {
  valorPorAmigo: 30, // R$ por amigo com primeiro depósito validado
  bonusSurpresa: 200, // R$ extra ao chegar na meta do mês
  metaBonus: 10, // amigos validados no mês para o bônus surpresa
  capMensal: 10, // máximo de recompensas por membro no mês (MVP)
  ftdMinimo: 30, // R$ mínimo do primeiro depósito
  holdDias: 3, // dias em análise depois de validada, antes de liberar o PIX
  slaHoras: 48, // prazo de validação do comprovante
} as const;

export const OTP_ATIVO = process.env.OTP_ATIVO === 'true';

export function siteUrl(): string {
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  return (process.env.NEXT_PUBLIC_SITE_URL || vercel || 'http://localhost:3000').replace(/\/$/, '');
}

export function linkConvite(codigo: string): string {
  return `${siteUrl()}/c/${codigo}`;
}

export function linkConviteCurto(codigo: string): string {
  return `${siteUrl().replace(/^https?:\/\//, '')}/c/${codigo}`;
}
