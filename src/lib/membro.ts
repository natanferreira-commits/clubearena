import 'server-only';
import { redirect } from 'next/navigation';
import { getRepo } from './repo';
import { membroLogadoId } from './session';

/** Membro da sessão, ou redireciona para o login voltando para `aqui`. */
export async function exigirMembro(aqui: string) {
  const id = await membroLogadoId();
  const membro = id ? await getRepo().membroPorId(id) : null;
  if (!membro) redirect(`/entrar?modo=login&next=${encodeURIComponent(aqui)}`);
  return membro;
}
