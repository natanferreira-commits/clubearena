import { REGRAS } from '@/lib/config';
import { brl, dataHora, formatarTelefone, horasDesde } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { Fila, type ItemFila } from './Fila';

export default async function Comprovantes() {
  const repo = getRepo();
  const [pendentes, decididas, casas] = await Promise.all([
    repo.conversoes({ status: ['pendente'] }),
    repo.conversoes({ status: ['validada', 'rejeitada', 'paga'], desde: new Date(Date.now() - 14 * 86_400_000) }),
    repo.casas(false),
  ]);
  const ids = [...new Set([...pendentes, ...decididas].flatMap((c) => [c.convidado_id, c.indicador_id]).filter((x): x is string => !!x))];
  const membros = await repo.membrosPorIds(ids);
  const m = (id: string | null) => membros.find((x) => x.id === id);

  // Mais antigos primeiro: SLA de 48 h.
  const fila: ItemFila[] = await Promise.all(
    pendentes
      .sort((a, b) => (a.enviada_em ?? '').localeCompare(b.enviada_em ?? ''))
      .map(async (c) => {
        const convidado = m(c.convidado_id);
        const quem = m(c.indicador_id);
        return {
          id: c.id,
          convidado: convidado?.apelido ?? '—',
          telefone: convidado ? formatarTelefone(convidado.telefone) : '—',
          convidou: quem?.apelido ?? 'Entrou sozinho',
          casa: casas.find((x) => x.id === c.casa_id)?.nome ?? '—',
          valor: c.valor_ftd !== null ? brl(c.valor_ftd) : 'não informado',
          valorBaixo: c.valor_ftd !== null && c.valor_ftd < REGRAS.ftdMinimo,
          enviada: dataHora(c.enviada_em),
          atrasada: horasDesde(c.enviada_em) > 24,
          alerta: convidado?.flag_fraude ?? null,
          printCadastro: c.comprovante_cadastro_url ? await repo.urlArquivo(c.comprovante_cadastro_url) : null,
          printFtd: c.comprovante_ftd_url ? await repo.urlArquivo(c.comprovante_ftd_url) : null,
        };
      }),
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="title">Comprovantes</h1>
        <span className="caption">SLA de {REGRAS.slaHoras} h · confira sempre com o painel da casa</span>
      </div>
      <Fila itens={fila} />

      <div className="card stack gap-10">
        <h2 className="heading">Decididos nos últimos 14 dias</h2>
        {decididas.length === 0 ? (
          <div className="caption">Nada por aqui ainda.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Convidado</th><th>Quem convidou</th><th>Casa</th><th>Status</th><th>Por</th><th>Quando</th></tr>
              </thead>
              <tbody>
                {decididas.slice(0, 50).map((c) => (
                  <tr key={c.id}>
                    <td>{m(c.convidado_id)?.apelido ?? '—'}</td>
                    <td>{m(c.indicador_id)?.apelido ?? '—'}</td>
                    <td>{casas.find((x) => x.id === c.casa_id)?.nome ?? '—'}</td>
                    <td>
                      <span className={`tag ${c.status === 'rejeitada' ? 'erro' : 'ok'}`}>{c.status === 'rejeitada' ? 'Rejeitado' : c.status === 'paga' ? 'Pago' : 'Validado'}</span>
                      {c.motivo_rejeicao && <div className="micro">{c.motivo_rejeicao}</div>}
                    </td>
                    <td>{c.validada_por ?? '—'}</td>
                    <td>{dataHora(c.validada_em)}</td>
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
