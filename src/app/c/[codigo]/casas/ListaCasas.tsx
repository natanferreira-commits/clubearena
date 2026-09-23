'use client';

import { useRouter } from 'next/navigation';

type CasaCard = { slug: string; nome: string; logo: string | null; bonus: string | null };

export function ListaCasas({ codigo, casas }: { codigo: string; casas: CasaCard[] }) {
  const router = useRouter();
  return (
    <div className="stack" style={{ borderTop: '1px solid var(--line-100)' }}>
      {casas.map((c) => (
        <div className="casa" key={c.slug}>
          <div className="casa-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.logo ? <img src={c.logo} alt="" /> : c.nome.replace(/^Casa\s+/i, '').slice(0, 1)}
          </div>
          <div>
            <div className="step-t">{c.nome}</div>
            <div className="casa-bonus">{c.bonus ? <>Bônus de boas-vindas: {c.bonus}</> : 'Conta nova na casa parceira.'}</div>
            <a
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              href={`/ir/${c.slug}?c=${codigo}`}
              target="_blank"
              rel="noopener"
              onClick={() => setTimeout(() => router.push(`/c/${codigo}/aguardando?casa=${c.slug}`), 300)}
            >
              Entrar na {c.nome}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
