import Link from 'next/link';
import { getRepo } from '@/lib/repo';

export { Topbar, Progresso, Rodape, RodapeCompacto, Passos } from './ui';

export function DemoBar() {
  if (getRepo().modo !== 'demo') return null;
  return (
    <div className="demo-bar">
      Modo demonstração: dados de exemplo em memória. <Link href="/admin">Admin</Link> (senha: arena)
    </div>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBar />
      <main className="page">{children}</main>
    </>
  );
}

