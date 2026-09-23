import { pagamentosPendentes } from '@/lib/clube';
import { REGRAS } from '@/lib/config';
import { brl, dataHora, formatarTelefone, mascararPix } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { ListaPagamentos } from './ListaPagamentos';

export default async function Payouts() {
  const repo = getRepo();
  const [itens, historico] = await Promise.all([pagamentosPendentes(), repo.payouts()]);
  const membros = await repo.membrosPorIds([...new Set(historico.slice(0, 50).map((p) => p.membro_id))]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="title">PIX a pagar</h1>
        <span className="caption">Só entra aqui o que passou dos {REGRAS.holdDias} dias de análise</span>
      </div>
      <ListaPagamentos
        itens={itens.map((i) => ({
          membroId: i.membro.id,
          apelido: i.membro.apelido,
          telefone: formatarTelefone(i.membro.telefone),
          whatsapp: i.membro.telefone,
          convites: i.conversoes.length,
          bonus: i.bonus.reduce((s, b) => s + b.valor, 0),
          total: brl(i.total),
          temPix: !!i.membro.chave_pix,
          pix: mascararPix(i.membro.tipo_pix, i.membro.chave_pix),
          chaveCompleta: i.membro.chave_pix,
          titular: i.membro.titular_pix,
          pixRecente: i.pixRecente,
        }))}
      />

      <div className="card stack gap-10">
        <h2 className="heading">Pagos</h2>
        {historico.length === 0 ? (
          <div className="caption">Nenhum PIX registrado ainda.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Membro</th><th>Tipo</th><th>Valor</th><th>Chave</th><th>Pago por</th><th>Quando</th></tr>
              </thead>
              <tbody>
                {historico.slice(0, 50).map((p) => (
                  <tr key={p.id}>
                    <td>{membros.find((m) => m.id === p.membro_id)?.apelido ?? '—'}</td>
                    <td>{p.tipo === 'bonus' ? `Bônus surpresa (${p.mes})` : `${p.conversoes_ids.length} convite(s)`}</td>
                    <td className="num">{brl(p.valor)}</td>
                    <td className="mono micro">{p.chave_pix}</td>
                    <td>{p.pago_por ?? '—'}</td>
                    <td>{dataHora(p.pago_em)}</td>
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
