import { NextResponse } from 'next/server';
import { siteUrl } from '@/lib/config';
import { horasDesde } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { enviarWhatsApp } from '@/lib/zapi';

// Lembra o convidado que escolheu a casa e não voltou com o comprovante (PRD §5 etapa 8).
// Chamar a cada 10–15 min (cron externo) com Authorization: Bearer CRON_SECRET.
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get('authorization') !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 });
  }

  const repo = getRepo();
  const abertas = await repo.conversoes({ status: ['aguardando_comprovante'], desde: new Date(Date.now() - 3 * 86_400_000) });
  const membros = await repo.membrosPorIds([...new Set(abertas.map((c) => c.convidado_id))]);
  let enviados = 0;

  for (const c of abertas) {
    const m = membros.find((x) => x.id === c.convidado_id);
    if (!m) continue;
    const horas = horasDesde(c.criada_em);
    if (!c.lembrete_30_em && horas >= 0.5) {
      await enviarWhatsApp(m.telefone, `Oi, ${m.apelido}! Já criou sua conta na casa parceira? Volte para enviar os prints do cadastro e do depósito: ${siteUrl()}/comprovante`);
      await repo.atualizarConversao(c.id, { lembrete_30_em: new Date().toISOString() });
      enviados++;
    } else if (c.lembrete_30_em && !c.lembrete_24h_em && horas >= 24) {
      await enviarWhatsApp(m.telefone, `${m.apelido}, seu convite do Clube Arena ainda está esperando os prints. Leva 1 minuto: ${siteUrl()}/comprovante`);
      await repo.atualizarConversao(c.id, { lembrete_24h_em: new Date().toISOString() });
      enviados++;
    }
  }
  return NextResponse.json({ verificadas: abertas.length, enviados });
}
