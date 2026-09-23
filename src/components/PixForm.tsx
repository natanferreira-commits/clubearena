'use client';

import { useState, useTransition } from 'react';
import { salvarPix } from '@/app/entrar/actions';

const TIPOS = [
  ['cpf', 'CPF', '000.000.000-00'],
  ['celular', 'Celular', '(11) 90000-0000'],
  ['email', 'E-mail', 'voce@email.com'],
  ['aleatoria', 'Aleatória', '32 caracteres'],
] as const;

export function PixForm({ onPronto, onPular, rotulo = 'Concluir cadastro', inicial }: {
  onPronto: () => void;
  onPular?: () => void;
  rotulo?: string;
  inicial?: { tipo: string | null; titular: string | null };
}) {
  const [tipo, setTipo] = useState<string>(inicial?.tipo ?? 'cpf');
  const [chave, setChave] = useState('');
  const [titular, setTitular] = useState(inicial?.titular ?? '');
  const [erro, setErro] = useState<{ campo?: string; msg: string } | null>(null);
  const [pendente, start] = useTransition();
  const pronto = chave.trim().length >= 5 && titular.trim().length >= 3;

  return (
    <form
      className="stack gap-24"
      style={{ flex: 1 }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await salvarPix({ tipo, chave, titular });
          if (r.ok) onPronto();
          else setErro({ campo: r.campo, msg: r.erro ?? 'Algo deu errado.' });
        });
      }}
    >
      <div className="stack gap-16">
        <div className="field">
          <span className="field-label">Tipo de chave</span>
          <div className="seg">
            {TIPOS.map(([id, label]) => (
              <button type="button" key={id} className={tipo === id ? 'on' : ''} onClick={() => { setTipo(id); setChave(''); }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="field-label">Chave PIX</span>
          <div className={`input${erro?.campo === 'chave' ? ' erro' : ''}`}>
            <input value={chave} onChange={(e) => setChave(e.target.value)} placeholder={TIPOS.find((t) => t[0] === tipo)![2]} inputMode={tipo === 'cpf' || tipo === 'celular' ? 'numeric' : 'text'} />
          </div>
        </label>
        <label className="field">
          <span className="field-label">Nome do titular</span>
          <div className={`input${erro?.campo === 'titular' ? ' erro' : ''}`}>
            <input value={titular} onChange={(e) => setTitular(e.target.value)} placeholder="Como está no banco" />
          </div>
        </label>
        {erro && <span className="erro-msg">{erro.msg}</span>}
        <div className="note">
          Usamos a chave só para pagar a recompensa. Conferimos o nome do titular antes de cada pagamento. Você pode alterar a chave a qualquer momento no seu painel.
        </div>
      </div>
      <div className="push-bottom stack gap-10">
        <button className="btn btn-primary" disabled={pendente} aria-disabled={!pronto}>
          {pendente ? 'Salvando…' : rotulo}
        </button>
        {onPular && (
          <button type="button" className="btn-link" onClick={onPular}>
            Informar depois
          </button>
        )}
      </div>
    </form>
  );
}
