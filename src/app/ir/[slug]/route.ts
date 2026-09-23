import { NextResponse } from 'next/server';
import { getRepo } from '@/lib/repo';
import { membroLogadoId } from '@/lib/session';

// Convidado clicou em "Entrar" numa casa: abre a conversão e manda pro link da casa.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepo();
  const casa = await repo.casaPorSlug(slug);
  if (!casa || !casa.ativa) return NextResponse.redirect(new URL('/', req.url));

  const id = await membroLogadoId();
  const membro = id ? await repo.membroPorId(id) : null;
  if (membro) {
    const abertas = await repo.conversoes({ convidadoId: membro.id, status: ['aguardando_comprovante', 'pendente', 'validada', 'paga'] });
    const aguardando = abertas.find((c) => c.status === 'aguardando_comprovante');
    const jaConfirmada = abertas.some((c) => c.status !== 'aguardando_comprovante');
    if (aguardando && aguardando.casa_id !== casa.id) {
      await repo.atualizarConversao(aguardando.id, { casa_id: casa.id });
    } else if (!aguardando && !jaConfirmada) {
      await repo.criarConversao({ convidado_id: membro.id, indicador_id: membro.indicado_por, casa_id: casa.id });
    }
    await repo.registrarEvento({ evento: 'escolheu_casa', membro_id: membro.id, meta: { casa: casa.slug } });
  }
  return NextResponse.redirect(casa.link_afiliado);
}
