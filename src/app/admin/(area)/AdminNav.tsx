'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITENS = [
  ['/admin/dashboard', 'Visão geral'],
  ['/admin/comprovantes', 'Comprovantes'],
  ['/admin/payouts', 'PIX'],
  ['/admin/casas', 'Casas'],
] as const;

export function AdminNav() {
  const atual = usePathname();
  return (
    <nav>
      {ITENS.map(([href, rotulo]) => (
        <Link key={href} href={href} className={atual.startsWith(href) ? 'on' : ''}>
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
