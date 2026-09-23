'use server';

import { conferirCodigo, criarMembro, enviarCodigo } from '@/lib/clube';
import { OTP_ATIVO } from '@/lib/config';
import { APELIDO_RE, normalizarTelefone } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { logarMembro, membroLogadoId, metaRequisicao } from '@/lib/session';

export type Resultado = { ok?: true; erro?: string; campo?: string; precisaCodigo?: true; jaMembro?: true };

export async function cadastrar(p: { telefone: string; apelido: string; aceite: boolean; convite?: string; codigo?: string }): Promise<Resultado> {
  const telefone = normalizarTelefone(p.telefone);
  if (!telefone) return { erro: 'Informe um celular com DDD.', campo: 'telefone' };
  if (!APELIDO_RE.test(p.apelido)) return { erro: 'Use de 3 a 14 letras ou números, sem espaço.', campo: 'apelido' };
  if (!p.aceite) return { erro: 'Confirme que tem mais de 18 anos e aceita as regras.', campo: 'aceite' };

  const repo = getRepo();
  const existente = await repo.membroPorTelefone(telefone);
  if (existente) return { erro: 'Esse WhatsApp já está no clube.', campo: 'telefone', jaMembro: true };

  if (OTP_ATIVO) {
    if (!p.codigo) {
      await enviarCodigo(telefone);
      return { precisaCodigo: true };
    }
    if (!(await conferirCodigo(telefone, p.codigo))) return { erro: 'Código inválido. Confira a mensagem no WhatsApp.', campo: 'codigo' };
  }

  const convidadoPor = p.convite ? await repo.membroPorCodigo(p.convite) : null;
  const { fingerprint, ip } = await metaRequisicao();
  try {
    const membro = await criarMembro({ telefone, apelido: p.apelido, convidadoPor, fingerprint, ip });
    await logarMembro(membro.id);
    return { ok: true };
  } catch (e) {
    if (String(e).includes('duplicate')) return { erro: 'Esse WhatsApp já está no clube.', campo: 'telefone', jaMembro: true };
    throw e;
  }
}

export async function entrar(p: { telefone: string; codigo?: string }): Promise<Resultado> {
  const telefone = normalizarTelefone(p.telefone);
  if (!telefone) return { erro: 'Informe um celular com DDD.', campo: 'telefone' };
  const repo = getRepo();
  const membro = await repo.membroPorTelefone(telefone);
  if (!membro) return { erro: 'Não encontramos esse WhatsApp no clube.', campo: 'telefone' };

  if (OTP_ATIVO) {
    if (!p.codigo) {
      await enviarCodigo(telefone);
      return { precisaCodigo: true };
    }
    if (!(await conferirCodigo(telefone, p.codigo))) return { erro: 'Código inválido. Confira a mensagem no WhatsApp.', campo: 'codigo' };
  }
  await repo.atualizarMembro(membro.id, { ultimo_login: new Date().toISOString() });
  await logarMembro(membro.id);
  return { ok: true };
}

export async function salvarPix(p: { tipo: string; chave: string; titular: string }): Promise<Resultado> {
  const id = await membroLogadoId();
  if (!id) return { erro: 'Sua sessão expirou. Entre de novo.' };
  const chave = p.chave.trim();
  const d = chave.replace(/\D/g, '');
  const valido =
    (p.tipo === 'cpf' && d.length === 11) ||
    (p.tipo === 'celular' && d.length >= 10 && d.length <= 13) ||
    (p.tipo === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) ||
    (p.tipo === 'aleatoria' && chave.length >= 32 && chave.length <= 36);
  if (!valido) return { erro: 'Informe uma chave válida.', campo: 'chave' };
  if (p.titular.trim().length < 3) return { erro: 'Informe o nome do titular.', campo: 'titular' };
  await getRepo().atualizarMembro(id, {
    tipo_pix: p.tipo,
    chave_pix: p.tipo === 'cpf' || p.tipo === 'celular' ? d : chave,
    titular_pix: p.titular.trim(),
    pix_atualizado_em: new Date().toISOString(),
  });
  return { ok: true };
}
