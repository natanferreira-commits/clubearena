'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import type { Casa } from '@/lib/repo/types';
import { salvarCasa } from '../../actions';

export function FormCasa({ casa }: { casa: Casa | null }) {
  const router = useRouter();
  const [estado, acao, pendente] = useActionState(salvarCasa, {});
  useEffect(() => {
    if (estado.ok) router.push('/admin/casas');
  }, [estado.ok, router]);

  const campo = (name: keyof Casa, rotulo: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span className="field-label">{rotulo}</span>
      <div className="input">
        <input name={name} defaultValue={casa?.[name] === null || casa?.[name] === undefined ? '' : String(casa[name])} {...extra} />
      </div>
    </label>
  );

  return (
    <form action={acao} className="stack gap-16">
      {casa && <input type="hidden" name="id" value={casa.id} />}
      <div className="form-grid">
        {campo('nome', 'Nome', { required: true, placeholder: 'Nome da casa' })}
        {campo('slug', 'Identificador na URL', { placeholder: 'gerado a partir do nome' })}
        {campo('link_afiliado', 'Link de cadastro (com tracking)', { required: true, placeholder: 'https://…' })}
        {campo('logo_url', 'URL do logo', { placeholder: 'https://… (opcional)' })}
        {campo('bonus_amigo', 'Oferta para o convidado', { placeholder: 'ex: R$ 20 em aposta grátis' })}
        {campo('cpa_valor', 'Valor de referência (interno)', { inputMode: 'decimal', placeholder: 'R$' })}
        {campo('ordem', 'Ordem no grid', { type: 'number' })}
      </div>
      <label className="check" style={{ alignItems: 'center' }}>
        <input type="checkbox" name="ativa" defaultChecked={casa?.ativa ?? true} style={{ width: 18, height: 18 }} />
        <span className="body">Ativa (aparece para os convidados)</span>
      </label>
      {estado.erro && <div className="toast erro">{estado.erro}</div>}
      <div style={{ display: 'flex', gap: 10, maxWidth: 360 }}>
        <Link href="/admin/casas" className="btn btn-outline btn-sm" style={{ flex: 1 }}>Cancelar</Link>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={pendente}>{pendente ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  );
}
