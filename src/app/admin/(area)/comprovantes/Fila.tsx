'use client';

import { useState, useTransition } from 'react';
import { rejeitar, validar } from '../../actions';

export type ItemFila = {
  id: string;
  convidado: string;
  telefone: string;
  convidou: string;
  casa: string;
  valor: string;
  valorBaixo: boolean;
  enviada: string;
  atrasada: boolean;
  alerta: string | null;
  printCadastro: string | null;
  printFtd: string | null;
};

const MOTIVOS = ['Print ilegível', 'Conta já existia na casa', 'Depósito abaixo do mínimo', 'Não encontrado no painel da casa', 'Print editado ou de outra pessoa'];

export function Fila({ itens }: { itens: ItemFila[] }) {
  const [aberto, setAberto] = useState<ItemFila | null>(null);
  const [motivo, setMotivo] = useState('');
  const [rejeitando, setRejeitando] = useState(false);
  const [msg, setMsg] = useState<{ tom: 'ok' | 'erro'; texto: string } | null>(null);
  const [pendente, start] = useTransition();

  function fechar() {
    setAberto(null);
    setRejeitando(false);
    setMotivo('');
  }

  function decidir(item: ItemFila, acao: 'validar' | 'rejeitar') {
    start(async () => {
      const r = acao === 'validar' ? await validar(item.id) : await rejeitar(item.id, motivo);
      if (r.erro) setMsg({ tom: 'erro', texto: r.erro });
      else {
        setMsg({ tom: 'ok', texto: `${item.convidado}: ${acao === 'validar' ? 'validado' : 'rejeitado'}. Avisos enviados no WhatsApp.` });
        fechar();
      }
    });
  }

  return (
    <>
      {msg && <div className={`toast ${msg.tom}`}>{msg.texto}</div>}
      <div className="card">
        {itens.length === 0 ? (
          <div className="caption">Nenhum comprovante esperando validação.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Convidado</th><th>Quem convidou</th><th>Casa</th><th>Depósito</th><th>Prints</th><th>Enviado</th><th /></tr>
              </thead>
              <tbody>
                {itens.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="strong">{i.convidado}</div>
                      <div className="micro">{i.telefone}</div>
                      {i.alerta && <div className="warn">⚠ {i.alerta}</div>}
                    </td>
                    <td>{i.convidou}</td>
                    <td>{i.casa}</td>
                    <td className={i.valorBaixo ? 'warn' : ''}>{i.valor}</td>
                    <td>
                      <div className="thumbs" onClick={() => { setAberto(i); setMsg(null); }} style={{ cursor: 'pointer' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {i.printCadastro && <img src={i.printCadastro} alt="Print do cadastro" />}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {i.printFtd && <img src={i.printFtd} alt="Print do depósito" />}
                      </div>
                    </td>
                    <td>
                      {i.enviada}
                      {i.atrasada && <div className="warn">há mais de 24 h</div>}
                    </td>
                    <td>
                      <button className="btn btn-dark btn-sm" onClick={() => { setAberto(i); setMsg(null); }}>Abrir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aberto && (
        <div className="modal-bg" onClick={fechar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 className="heading">{aberto.convidado}</h2>
                <div className="caption">
                  {aberto.telefone} · convidado por {aberto.convidou} · {aberto.casa} · depósito {aberto.valor}
                </div>
                {aberto.alerta && <div className="warn" style={{ marginTop: 4 }}>⚠ {aberto.alerta}</div>}
              </div>
              <button className="btn-link" style={{ height: 'auto' }} onClick={fechar}>Fechar</button>
            </div>
            <div className="modal-prints">
              {[['Cadastro', aberto.printCadastro], ['Primeiro depósito', aberto.printFtd]].map(([rotulo, url]) => (
                <div key={rotulo} className="stack gap-6">
                  <span className="label-caps">{rotulo}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Print: ${rotulo}`} />
                    </a>
                  ) : (
                    <div className="caption">Sem arquivo</div>
                  )}
                </div>
              ))}
            </div>

            {rejeitando ? (
              <div className="stack gap-10">
                <span className="field-label">Motivo (vai para o convidado no WhatsApp)</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MOTIVOS.map((mo) => (
                    <button key={mo} type="button" className={`tag${motivo === mo ? ' brand' : ''}`} style={{ border: 0, cursor: 'pointer' }} onClick={() => setMotivo(mo)}>
                      {mo}
                    </button>
                  ))}
                </div>
                <textarea className="textarea" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ou escreva o motivo" />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setRejeitando(false)} disabled={pendente}>Voltar</button>
                  <button className="btn btn-danger" onClick={() => decidir(aberto, 'rejeitar')} disabled={pendente}>{pendente ? 'Rejeitando…' : 'Confirmar rejeição'}</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setRejeitando(true)} disabled={pendente}>Rejeitar</button>
                <button className="btn btn-primary" onClick={() => decidir(aberto, 'validar')} disabled={pendente}>{pendente ? 'Validando…' : 'Validar'}</button>
              </div>
            )}
            {msg?.tom === 'erro' && <div className="toast erro">{msg.texto}</div>}
          </div>
        </div>
      )}
    </>
  );
}
