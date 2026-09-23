import { redirect } from 'next/navigation';
import { Page, RodapeCompacto, Topbar } from '@/components/Shell';
import { adminLogado } from '@/lib/session';
import { LoginAdmin } from './LoginAdmin';

export default async function Admin() {
  if (await adminLogado()) redirect('/admin/dashboard');
  return (
    <Page>
      <Topbar direita={<span className="caption">Admin</span>} />
      <div className="screen">
        <div>
          <h1 className="title" style={{ marginBottom: 10 }}>Área da equipe</h1>
          <p className="body">Validação de comprovantes, PIX e casas parceiras.</p>
        </div>
        <LoginAdmin />
      </div>
      <RodapeCompacto />
    </Page>
  );
}
