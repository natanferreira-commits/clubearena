import Link from 'next/link';
import { brl } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { FormCasa } from './FormCasa';

export default async function Casas({ searchParams }: { searchParams: Promise<{ editar?: string; nova?: string }> }) {
  const { editar, nova } = await searchParams;
  const casas = await getRepo().casas(false);
  const emEdicao = casas.find((c) => c.id === editar) ?? null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="title">Casas parceiras</h1>
        <Link href="/admin/casas?nova=1" className="btn btn-primary btn-sm">Adicionar casa</Link>
      </div>

      {(emEdicao || nova) && (
        <div className="card stack gap-16">
          <h2 className="heading">{emEdicao ? `Editar ${emEdicao.nome}` : 'Nova casa'}</h2>
          <FormCasa key={emEdicao?.id ?? 'nova'} casa={emEdicao} />
        </div>
      )}

      <div className="card">
        {casas.length === 0 ? (
          <div className="caption">Nenhuma casa cadastrada. Sem casa ativa, o convidado não tem onde criar conta.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Ordem</th><th>Casa</th><th>Oferta para o convidado</th><th>Referência interna</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {casas.map((c) => (
                  <tr key={c.id}>
                    <td className="num">{c.ordem}</td>
                    <td>
                      <div className="strong">{c.nome}</div>
                      <div className="micro mono">/{c.slug}</div>
                    </td>
                    <td>{c.bonus_amigo ?? <span className="warn">sem oferta — o card fica menos atraente</span>}</td>
                    <td className="num">{c.cpa_valor !== null ? brl(c.cpa_valor) : '—'}</td>
                    <td><span className={`tag ${c.ativa ? 'ok' : ''}`}>{c.ativa ? 'Ativa' : 'Inativa'}</span></td>
                    <td><Link href={`/admin/casas?editar=${c.id}`} className="u">Editar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
