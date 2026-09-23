'use server';

import { getRepo } from '@/lib/repo';
import { membroLogadoId } from '@/lib/session';

export async function registrarCompartilhou(canal: string) {
  const id = await membroLogadoId();
  if (!id) return;
  await getRepo().registrarEvento({ evento: 'compartilhou', membro_id: id, meta: { canal } });
}
