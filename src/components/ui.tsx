import Link from 'next/link';

export function Topbar({ direita }: { direita?: React.ReactNode }) {
  return (
    <div className="topbar">
      <Link href="/" className="wordmark">
        Clube Arena<span>.</span>
      </Link>
      {direita ?? (
        <Link href="/regras" className="topbar-link">
          Regras
        </Link>
      )}
    </div>
  );
}

export function Progresso({ pct }: { pct: number }) {
  return (
    <div className="progress">
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Rodape({ texto }: { texto?: string }) {
  return (
    <footer className="footer">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="badge-18">18+</span>
        <span>Jogue com responsabilidade. Apostas podem causar dependência.</span>
      </div>
      <div>
        {texto ??
          'Clube Arena é uma comunidade de membros. As recompensas do clube podem ser alteradas sem aviso prévio. A recompensa fica em análise por 3 dias depois da validação do comprovante.'}
      </div>
      <div className="footer-links">
        <Link href="/regras">Regras</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/regras#ajuda">Ajuda</Link>
      </div>
    </footer>
  );
}

export function RodapeCompacto() {
  return (
    <div className="footer-compact">
      <span className="badge-18">18+</span>
      <span>Jogue com responsabilidade.</span>
    </div>
  );
}

export function Passos({ itens }: { itens: { t: string; d: string }[] }) {
  return (
    <div className="stack">
      {itens.map((p, i) => (
        <div className="step" key={p.t}>
          <div className="step-n">{String(i + 1).padStart(2, '0')}</div>
          <div>
            <div className="step-t">{p.t}</div>
            <div className="step-d">{p.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
