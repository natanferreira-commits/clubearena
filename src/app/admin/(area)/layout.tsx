import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DemoBar } from '@/components/Shell';
import { adminLogado } from '@/lib/session';
import { sairAdmin } from '../actions';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const nome = await adminLogado();
  if (!nome) redirect('/admin');
  return (
    <div className="admin">
      <DemoBar />
      <header className="admin-nav">
        <Link href="/admin/dashboard" className="wordmark">
          Clube Arena<span>.</span> <span className="caption" style={{ fontWeight: 400 }}>admin</span>
        </Link>
        <AdminNav />
        <form action={sairAdmin} style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="caption">{nome}</span>
          <button className="btn-link" style={{ height: 'auto' }}>Sair</button>
        </form>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
