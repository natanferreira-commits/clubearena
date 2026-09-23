import type { LinhaRanking } from '@/lib/clube';

export function Ranking({ linhas, vazio, destaque }: { linhas: LinhaRanking[]; vazio: string; destaque?: string | null }) {
  if (!linhas.length) {
    return (
      <div className="stack gap-10" style={{ marginTop: 10 }}>
        <div className="rank-empty">
          <div>—</div>
          <div>Seu apelido</div>
          <div className="num">0</div>
        </div>
        <div className="caption">{vazio}</div>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="rank-head label-caps">
        <div>#</div>
        <div>Membro</div>
        <div>Amigos</div>
      </div>
      {linhas.map((r) => (
        <div className={`rank-row${destaque === r.membroId ? ' me' : ''}`} key={r.membroId}>
          <div className="pos">{r.pos}</div>
          <div className="nome">
            {r.apelido}
            <div className="sub">{[r.nivel, r.historico].filter(Boolean).join(' · ')}</div>
          </div>
          <div className="num strong">{r.convites}</div>
        </div>
      ))}
    </div>
  );
}
