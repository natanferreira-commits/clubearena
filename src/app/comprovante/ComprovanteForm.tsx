'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { UploadPrint } from '@/components/UploadPrint';
import { enviarComprovante } from './actions';

export function ComprovanteForm({ casas, casaInicial, slaHoras }: { casas: { slug: string; nome: string }[]; casaInicial: string | null; slaHoras: number }) {
  const router = useRouter();
  const [casa, setCasa] = useState(casaInicial ?? '');
  const [cadastro, setCadastro] = useState<Blob | null>(null);
  const [ftd, setFtd] = useState<Blob | null>(null);
  const [valor, setValor] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, start] = useTransition();
  const pronto = !!casa && !!cadastro && !!ftd;

  return (
    <form
      className="stack gap-24"
      style={{ flex: 1 }}
      onSubmit={(e) => {
        e.preventDefault();
        setTentou(true);
        if (!pronto) return;
        const fd = new FormData();
        fd.set('casa', casa);
        fd.set('cadastro', new File([cadastro!], 'cadastro.jpg', { type: cadastro!.type || 'image/jpeg' }));
        fd.set('ftd', new File([ftd!], 'ftd.jpg', { type: ftd!.type || 'image/jpeg' }));
        fd.set('valor', valor);
        start(async () => {
          const r = await enviarComprovante(fd);
          if (r.ok) router.push('/comprovante/enviado');
          else setErro(r.erro ?? 'Não foi possível enviar agora. Tente de novo.');
        });
      }}
    >
      <div className="stack gap-16">
        <label className="field">
          <span className="field-label">Casa onde você criou a conta</span>
          <div className={`input${tentou && !casa ? ' erro' : ''}`}>
            <select value={casa} onChange={(e) => setCasa(e.target.value)}>
              <option value="" disabled>Escolha a casa</option>
              {casas.map((c) => (
                <option key={c.slug} value={c.slug}>{c.nome}</option>
              ))}
            </select>
          </div>
        </label>
        <UploadPrint titulo="Print do cadastro" dica="Tela da conta criada, com nome ou e-mail" erro={tentou} onArquivo={setCadastro} />
        <UploadPrint titulo="Print do primeiro depósito" dica="Comprovante com valor e data" erro={tentou} onArquivo={setFtd} />
        <label className="field">
          <span className="field-label">Valor depositado <span className="caption">(opcional)</span></span>
          <div className="input">
            <span className="input-prefix">R$</span>
            <input value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d,.]/g, ''))} inputMode="decimal" placeholder="30,00" />
          </div>
        </label>
        {erro && <div className="toast erro">{erro}</div>}
      </div>
      <div className="push-bottom stack gap-10">
        <button className="btn btn-primary" disabled={pendente} aria-disabled={!pronto}>
          {pendente ? 'Enviando…' : 'Enviar comprovantes'}
        </button>
        <div className="caption center">Validação em até {slaHoras} h. Você recebe a confirmação no WhatsApp.</div>
      </div>
    </form>
  );
}
