'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cadastrar, entrar, type Resultado } from '@/app/entrar/actions';
import { PixForm } from './PixForm';
import { Progresso, Topbar } from './ui';

type Etapa = 'dados' | 'codigo' | 'pix';

function formatarTel(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

/**
 * Cadastro do membro (e do convidado) — PRD telas 2, 3 e 7.
 * Etapas: dados → código no WhatsApp (só com OTP_ATIVO) → chave PIX (opcional, só para quem convida).
 */
export function CadastroForm({ modo, convite, destino, pedirPix, otp }: {
  modo: 'cadastro' | 'login';
  convite?: { codigo: string; apelido: string };
  destino: string;
  pedirPix: boolean;
  otp: boolean;
}) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>('dados');
  const [telefone, setTelefone] = useState('');
  const [apelido, setApelido] = useState('');
  const [aceite, setAceite] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<Resultado | null>(null);
  const [pendente, start] = useTransition();

  const etapas: Etapa[] = modo === 'login' ? (otp ? ['dados', 'codigo'] : ['dados']) : ['dados', ...(otp ? ['codigo' as const] : []), ...(pedirPix ? ['pix' as const] : [])];
  const idx = etapas.indexOf(etapa) + 1;

  const digitos = telefone.replace(/\D/g, '');
  const telOk = digitos.length >= 10;
  const apelidoOk = /^[a-zA-Z0-9_.]{3,14}$/.test(apelido);
  const dadosOk = modo === 'login' ? telOk : telOk && apelidoOk && aceite;

  function concluir() {
    if (pedirPix && modo === 'cadastro') setEtapa('pix');
    else {
      router.push(destino);
      router.refresh();
    }
  }

  function enviar(comCodigo?: string) {
    setTentou(true);
    if (!dadosOk) return;
    start(async () => {
      const r = modo === 'login'
        ? await entrar({ telefone, codigo: comCodigo })
        : await cadastrar({ telefone, apelido, aceite, convite: convite?.codigo, codigo: comCodigo });
      setErro(r.erro ? r : null);
      if (r.precisaCodigo) setEtapa('codigo');
      else if (r.ok) concluir();
    });
  }

  const titulo = modo === 'login' ? 'Entrar com seu WhatsApp' : convite ? 'Entrar no clube' : 'Entrar no clube';

  return (
    <>
      <Topbar direita={etapas.length > 1 ? <span className="caption">Passo {idx} de {etapas.length}</span> : undefined} />
      {etapas.length > 1 && <Progresso pct={(idx / etapas.length) * 100} />}

      {etapa === 'dados' && (
        <form className="screen" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
          <div>
            {convite && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="avatar">{convite.apelido.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}</div>
                <div className="small">
                  Você foi convidado por <span className="strong">{convite.apelido}</span>
                </div>
              </div>
            )}
            <h1 className="title" style={{ marginBottom: 10 }}>{titulo}</h1>
            <p className="body">
              {modo === 'login'
                ? 'Use o mesmo WhatsApp do seu cadastro.'
                : 'Seu WhatsApp é seu acesso. O apelido é como o clube vai te chamar.'}
            </p>
          </div>

          <div className="stack gap-16">
            <label className="field">
              <span className="field-label">WhatsApp</span>
              <div className={`input${(tentou && !telOk) || erro?.campo === 'telefone' ? ' erro' : ''}`}>
                <span className="input-prefix">+55</span>
                <input value={telefone} onChange={(e) => setTelefone(formatarTel(e.target.value))} inputMode="numeric" autoComplete="tel-national" placeholder="(11) 90000-0000" />
              </div>
              {tentou && !telOk && <span className="erro-msg">Informe um celular com DDD.</span>}
            </label>

            {modo === 'cadastro' && (
              <label className="field">
                <span className="field-label">Apelido</span>
                <div className={`input${(tentou && !apelidoOk) || erro?.campo === 'apelido' ? ' erro' : ''}`}>
                  <input value={apelido} onChange={(e) => setApelido(e.target.value.replace(/\s/g, ''))} maxLength={14} placeholder="ex: joao7x" autoComplete="nickname" />
                  <span className="input-suffix">{apelido.length}/14</span>
                </div>
                <span className="caption">Letras e números, sem espaço.</span>
              </label>
            )}
          </div>

          {modo === 'cadastro' && (
            <div className="check" role="checkbox" aria-checked={aceite} tabIndex={0} onClick={() => setAceite(!aceite)} onKeyDown={(e) => e.key === ' ' && (e.preventDefault(), setAceite(!aceite))}>
              <span className={`check-box${aceite ? ' on' : tentou ? ' erro' : ''}`}>{aceite ? '✓' : ''}</span>
              <span className="caption" style={{ color: 'var(--ink-700)' }}>
                Tenho mais de 18 anos e aceito as{' '}
                <Link href="/regras" target="_blank" className="u" onClick={(e) => e.stopPropagation()}>regras do clube</Link>. Sei que as recompensas podem mudar sem aviso.
              </span>
            </div>
          )}

          {erro?.erro && erro.campo !== 'codigo' && (
            <div className="toast erro">
              {erro.erro}{' '}
              {erro.jaMembro && <Link href={`/entrar?modo=login&next=${encodeURIComponent(destino)}`} className="u" style={{ color: 'inherit' }}>Entrar com ele</Link>}
            </div>
          )}

          <div className="push-bottom stack gap-10">
            <button className="btn btn-primary" disabled={pendente} aria-disabled={!dadosOk}>
              {pendente ? 'Aguarde…' : otp ? 'Receber código no WhatsApp' : modo === 'login' ? 'Entrar' : 'Entrar no clube'}
            </button>
            {modo === 'cadastro' ? (
              <div className="caption center">
                Já é membro? <Link href={`/entrar?modo=login&next=${encodeURIComponent(destino === '/bem-vindo' ? '/painel' : destino)}`} className="u">Entrar</Link>
              </div>
            ) : (
              <div className="caption center">
                Ainda não é membro? <Link href="/entrar" className="u">Criar meu convite</Link>
              </div>
            )}
          </div>
        </form>
      )}

      {etapa === 'codigo' && (
        <form className="screen" onSubmit={(e) => { e.preventDefault(); if (/^\d{6}$/.test(codigo)) enviar(codigo); }}>
          <div>
            <h1 className="title" style={{ marginBottom: 10 }}>Confirme seu WhatsApp</h1>
            <p className="body">
              Enviamos um código de 6 dígitos para <strong className="strong">+55 {telefone}</strong>.{' '}
              <a href="#" className="u" onClick={(e) => { e.preventDefault(); setEtapa('dados'); setCodigo(''); }}>Corrigir número</a>
            </p>
          </div>
          <div className="stack gap-8">
            <div className={`input${erro?.campo === 'codigo' ? ' erro' : ''}`} style={{ height: 64, justifyContent: 'center' }}>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" style={{ textAlign: 'center', fontSize: 28, letterSpacing: '0.4em', fontWeight: 500 }} />
            </div>
            {erro?.campo === 'codigo' && <span className="erro-msg">{erro.erro}</span>}
            <div className="caption">
              Não chegou? <a href="#" className="u" onClick={(e) => { e.preventDefault(); enviar(); }}>Reenviar código</a>
            </div>
          </div>
          <div className="push-bottom">
            <button className="btn btn-primary" disabled={pendente} aria-disabled={!/^\d{6}$/.test(codigo)}>
              {pendente ? 'Conferindo…' : 'Confirmar'}
            </button>
          </div>
        </form>
      )}

      {etapa === 'pix' && (
        <div className="screen">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Recompensa do clube</div>
            <h1 className="title" style={{ marginBottom: 10 }}>Onde você recebe a recompensa</h1>
            <p className="body">Cada amigo confirmado vale uma recompensa via PIX. A chave precisa estar no seu nome.</p>
          </div>
          <PixForm onPronto={() => { router.push(destino); router.refresh(); }} onPular={() => { router.push(destino); router.refresh(); }} />
        </div>
      )}
    </>
  );
}
