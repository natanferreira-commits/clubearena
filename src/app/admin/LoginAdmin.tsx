'use client';

import { useActionState } from 'react';
import { loginAdmin } from './actions';

export function LoginAdmin() {
  const [estado, acao, pendente] = useActionState(loginAdmin, {});
  return (
    <form action={acao} className="stack gap-24" style={{ flex: 1 }}>
      <div className="stack gap-16">
        <label className="field">
          <span className="field-label">Seu nome</span>
          <div className="input"><input name="nome" autoComplete="name" placeholder="Fica registrado em cada validação" /></div>
        </label>
        <label className="field">
          <span className="field-label">Senha</span>
          <div className={`input${estado.erro ? ' erro' : ''}`}><input name="senha" type="password" autoComplete="current-password" /></div>
        </label>
        {estado.erro && <span className="erro-msg">{estado.erro}</span>}
      </div>
      <div className="push-bottom">
        <button className="btn btn-primary" disabled={pendente}>{pendente ? 'Entrando…' : 'Entrar'}</button>
      </div>
    </form>
  );
}
