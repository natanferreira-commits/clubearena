import Link from 'next/link';
import { Page, Passos, Rodape, Topbar } from '@/components/Shell';
import { REGRAS } from '@/lib/config';
import { PASSOS_MEMBRO, REGRAS_CONVITE } from '@/lib/copy';
import { brl } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { membroLogadoId } from '@/lib/session';

export default async function Landing() {
  const logado = await membroLogadoId();
  await getRepo().registrarEvento({ evento: 'page_view', membro_id: logado, meta: { pagina: '/' } });
  const v = REGRAS.valorPorAmigo;

  return (
    <Page>
      <Topbar direita={logado ? <Link href="/painel" className="topbar-link">Meu painel</Link> : undefined} />

      <div className="hero">
        <div className="eyebrow" style={{ marginBottom: 16 }}>Seu convite vale PIX</div>
        <h1 className="display" style={{ marginBottom: 16 }}>
          Convide amigos. <span className="accent">{brl(v)} no seu PIX</span> por cada um que entrar.
        </h1>
        <p className="lead" style={{ marginBottom: 28 }}>
          Cada amigo que cria a conta numa casa parceira pelo seu convite e faz o primeiro depósito vale {brl(v)} de recompensa do clube.
        </p>
        <Link href={logado ? '/painel' : '/entrar'} className="btn btn-primary">
          {logado ? 'Ver meu convite' : 'Criar meu convite'}
        </Link>
        <div className="caption center" style={{ marginTop: 12 }}>Só WhatsApp e apelido. Sem custo.</div>
      </div>

      <div className="section" style={{ paddingTop: 8 }}>
        <h2 className="heading" style={{ marginBottom: 6 }}>Como funciona</h2>
        <Passos itens={PASSOS_MEMBRO} />
      </div>

      <div className="section">
        <h2 className="heading" style={{ marginBottom: 6 }}>Quanto vale</h2>
        <div className="rank-head label-caps" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>Amigos no mês</div>
          <div>Recompensa</div>
        </div>
        {[1, 5, 10].map((n) => (
          <div className="rank-row" key={n} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
            <div className="nome">{n === 1 ? '1 amigo' : `${n} amigos`}</div>
            <div className="num strong">{brl(n * v)}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <h2 className="heading" style={{ marginBottom: 8 }}>Quando o convite conta</h2>
        <div className="stack">
          {REGRAS_CONVITE.map((r) => (
            <div className="hairline-item" key={r}>{r}</div>
          ))}
        </div>
      </div>

      {!logado && (
        <div className="block stack gap-14" style={{ margin: '40px 24px 0', padding: '24px 20px' }}>
          <div>
            <div className="heading">Entrar no clube</div>
            <div className="small" style={{ marginTop: 4 }}>Seu WhatsApp é seu acesso. O apelido é como o clube vai te chamar.</div>
          </div>
          <Link href="/entrar" className="btn btn-primary">Criar meu convite</Link>
          <div className="micro center">
            Já é membro? <Link href="/entrar?modo=login" className="u">Entrar com meu WhatsApp</Link>
          </div>
        </div>
      )}

      <Rodape />
    </Page>
  );
}
