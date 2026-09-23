'use client';

import { useState, useTransition } from 'react';
import { pagar } from '../../actions';

type Item = {
  membroId: string;
  apelido: string;
  telefone: string;
  whatsapp: string;
  convites: number;
  bonus: number;
  total: string;
  temPix: boolean;
  pix: string;
  chaveCompleta: string | null;
  titular: string | null;
  pixRecente: boolean;
};

export function ListaPagamentos({ itens }: { itens: Item[] }) {
  const [aberto, setAberto] = useState<Item | null>(null);
  const [tipo, setTipo] = useState('cpf');
  const [chave, setChave] = useState('');
  const [titular, setTitular] = useState('');
  const [msg, setMsg] = useState<{ tom: 'ok' | 'erro'; texto: string } | null>(null);
  const [pendente, start] = useTransition();

  function abrir(i: Item) {
    setAberto(i);
    setChave('');
    setTitular(i.titular ?? '');
    setMsg(null);
  }

  function confirmar() {
    if (!aberto) return;
    const alvo = aberto;
    start(async () => {
      const r = await pagar(alvo.membroId, alvo.temPix && !chave ? undefined : { tipo, chave, titular });
      if (r.erro) setMsg({ tom: 'erro', texto: r.erro });
      else {
        setMsg({ tom: 'ok', texto: `${alvo.apelido}: ${alvo.total} marcado como pago. Membro avisado no WhatsApp.` });
        setAberto(null);
      }
    });
  }

  return (
    <>
      {msg && !aberto && <div className={`toast ${msg.tom}`}>{msg.texto}</div>}
      <div className="card">
        {itens.length === 0 ? (
          <div className="caption">Nenhum PIX pendente.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Membro</th><th>WhatsApp</th><th>Convites</th><th>Bônus</th><th>Total</th><th>Chave PIX</th><th /></tr>
              </thead>
              <tbody>
                {itens.map((i) => (
                  <tr key={i.membroId}>
                    <td className="strong">{i.apelido}</td>
                    <td>
                      <a href={`https://wa.me/${i.whatsapp}`} target="_blank" rel="noreferrer" className="u">{i.telefone}</a>
                    </td>
                    <td className="num">{i.convites}</td>
                    <td className="num">{i.bonus ? `R$ ${i.bonus}` : '—'}</td>
                    <td className="num strong">{i.total}</td>
                    <td>
                      {i.temPix ? i.pix : <span className="caption">pedir no WhatsApp</span>}
                      {i.pixRecente && <div className="warn">chave alterada nos últimos 7 dias</div>}
                    </td>
                    <td><button className="btn btn-dark btn-sm" onClick={() => abrir(i)}>Marcar como pago</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aberto && (
        <div className="modal-bg" onClick={() => setAberto(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="heading">Pagar {aberto.total} para {aberto.apelido}</h2>
              <div className="caption">
                {aberto.convites} convite(s){aberto.bonus ? ` + bônus surpresa de R$ ${aberto.bonus}` : ''}
              </div>
            </div>
            {aberto.temPix && (
              <div className="stack">
                <div className="row"><span>Chave</span><span className="mono">{aberto.chaveCompleta}</span></div>
                <div className="row"><span>Titular</span><span>{aberto.titular ?? '—'}</span></div>
                {aberto.pixRecente && <div className="warn" style={{ paddingTop: 8 }}>A chave foi alterada nos últimos 7 dias. Confirme com o membro pelo WhatsApp antes de pagar.</div>}
              </div>
            )}
            <div className="stack gap-10">
              <span className="field-label">{aberto.temPix ? 'Outra chave (opcional)' : 'Chave PIX informada pelo membro'}</span>
              <div className="seg">
                {[['cpf', 'CPF'], ['celular', 'Celular'], ['email', 'E-mail'], ['aleatoria', 'Aleatória']].map(([id, r]) => (
                  <button type="button" key={id} className={tipo === id ? 'on' : ''} onClick={() => setTipo(id)}>{r}</button>
                ))}
              </div>
              <div className="input"><input value={chave} onChange={(e) => setChave(e.target.value)} placeholder="Chave PIX" /></div>
              <div className="input"><input value={titular} onChange={(e) => setTitular(e.target.value)} placeholder="Nome do titular" /></div>
            </div>
            {msg?.tom === 'erro' && <div className="toast erro">{msg.texto}</div>}
            <div className="caption">Faça o PIX no banco primeiro. Este botão só registra o pagamento e avisa o membro.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setAberto(null)} disabled={pendente}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmar} disabled={pendente || (!aberto.temPix && !chave)}>
                {pendente ? 'Registrando…' : 'Já paguei'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
