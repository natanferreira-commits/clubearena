'use server';

import { randomUUID } from 'node:crypto';
import { REGRAS } from '@/lib/config';
import { brl } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { membroLogadoId } from '@/lib/session';

const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_BYTES = 3 * 1024 * 1024;

export async function enviarComprovante(fd: FormData): Promise<{ ok?: true; erro?: string }> {
  const id = await membroLogadoId();
  if (!id) return { erro: 'Sua sessão expirou. Entre de novo com seu WhatsApp.' };
  const repo = getRepo();
  const membro = await repo.membroPorId(id);
  if (!membro) return { erro: 'Sua sessão expirou. Entre de novo com seu WhatsApp.' };

  const casaSlug = String(fd.get('casa') ?? '');
  const casa = await repo.casaPorSlug(casaSlug);
  if (!casa) return { erro: 'Escolha a casa onde você criou a conta.' };

  const cadastro = fd.get('cadastro');
  const ftd = fd.get('ftd');
  if (!(cadastro instanceof File) || !cadastro.size || !(ftd instanceof File) || !ftd.size) return { erro: 'Envie os dois prints.' };
  for (const f of [cadastro, ftd]) {
    if (!TIPOS_OK.includes(f.type)) return { erro: 'Os prints precisam ser imagens (JPG ou PNG).' };
    if (f.size > MAX_BYTES) return { erro: 'Print muito grande. Tente de novo ou envie outro.' };
  }

  const valorTxt = String(fd.get('valor') ?? '').replace(/\./g, '').replace(',', '.').trim();
  const valor = valorTxt ? Number(valorTxt) : null;
  if (valor !== null && (!Number.isFinite(valor) || valor <= 0)) return { erro: 'Valor do depósito inválido.' };
  if (valor !== null && valor < REGRAS.ftdMinimo) return { erro: `O primeiro depósito precisa ser de pelo menos ${brl(REGRAS.ftdMinimo)}.` };

  const todas = await repo.conversoes({ convidadoId: membro.id });
  if (todas.some((c) => c.status === 'pendente')) return { erro: 'Você já tem um comprovante em validação. Aguarde a resposta no WhatsApp.' };
  if (todas.some((c) => c.status === 'validada' || c.status === 'paga')) return { erro: 'Seu cadastro já foi confirmado. Agora é sua vez de convidar.' };

  const ext = (f: File) => (f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg');
  const base = `${membro.id}/${randomUUID()}`;
  const [urlCadastro, urlFtd] = await Promise.all([
    repo.subirArquivo(`${base}-cadastro.${ext(cadastro)}`, await cadastro.arrayBuffer(), cadastro.type),
    repo.subirArquivo(`${base}-ftd.${ext(ftd)}`, await ftd.arrayBuffer(), ftd.type),
  ]);

  const dados = {
    status: 'pendente' as const,
    casa_id: casa.id,
    comprovante_cadastro_url: urlCadastro,
    comprovante_ftd_url: urlFtd,
    valor_ftd: valor,
    enviada_em: new Date().toISOString(),
    motivo_rejeicao: null,
  };
  const aberta = todas.find((c) => c.status === 'aguardando_comprovante') ?? todas.find((c) => c.status === 'rejeitada');
  if (aberta) await repo.atualizarConversao(aberta.id, dados);
  else {
    const nova = await repo.criarConversao({ convidado_id: membro.id, indicador_id: membro.indicado_por, casa_id: casa.id });
    await repo.atualizarConversao(nova.id, dados);
  }
  await repo.registrarEvento({ evento: 'comprovante_enviado', membro_id: membro.id, meta: { casa: casa.slug, valor } });
  return { ok: true };
}
