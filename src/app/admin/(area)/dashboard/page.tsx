import Link from 'next/link';
import { metricasAdmin } from '@/lib/clube';
import { brl } from '@/lib/format';

export default async function Dashboard() {
  const m = await metricasAdmin();
  const max = Math.max(1, ...m.porDia.map((d) => d.n));

  const cards: { rotulo: string; valor: string; sub?: string; href?: string; alerta?: boolean }[] = [
    { rotulo: 'Membros', valor: String(m.membros), sub: `${m.membrosMes} novos em ${m.mesNome}` },
    { rotulo: `Cliques em convites (${m.mesNome})`, valor: String(m.cliquesMes) },
    { rotulo: `Confirmados em ${m.mesNome}`, valor: String(m.validadasMes), sub: `${m.escolheramCasa30} escolheram casa nos últimos 30 dias` },
    { rotulo: 'Comprovantes na fila', valor: String(m.fila), sub: m.filaAtrasada ? `${m.filaAtrasada} há mais de 24 h` : 'Nenhum atrasado', href: '/admin/comprovantes', alerta: m.filaAtrasada > 0 },
    { rotulo: 'PIX a pagar', valor: brl(m.pixPendente), href: '/admin/payouts' },
  ];

  return (
    <>
      <h1 className="title">Visão geral</h1>
      <div className="metrics">
        {cards.map((c) => {
          const corpo = (
            <>
              <div className="caption">{c.rotulo}</div>
              <div className="metric-v num">{c.valor}</div>
              {c.sub && <div className={c.alerta ? 'warn' : 'micro'}>{c.sub}</div>}
            </>
          );
          return c.href ? (
            <Link href={c.href} className="card" key={c.rotulo}>{corpo}</Link>
          ) : (
            <div className="card" key={c.rotulo}>{corpo}</div>
          );
        })}
      </div>

      <div className="card stack gap-16">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="heading">Convites confirmados por dia</h2>
          <span className="caption">últimos 30 dias</span>
        </div>
        <div className="chart" role="img" aria-label="Convites confirmados por dia nos últimos 30 dias">
          {m.porDia.map((d) => (
            <div key={d.dia} className={d.n ? '' : 'zero'} style={{ height: `${(d.n / max) * 100}%` }} title={`${d.dia}: ${d.n}`} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="micro">
          <span>{m.porDia[0].dia}</span>
          <span>máx. {max}/dia</span>
          <span>{m.porDia[m.porDia.length - 1].dia}</span>
        </div>
      </div>
    </>
  );
}
