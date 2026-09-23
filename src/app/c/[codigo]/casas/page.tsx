import { notFound } from 'next/navigation';
import { Page, RodapeCompacto, Topbar } from '@/components/Shell';
import { getRepo } from '@/lib/repo';
import { exigirMembro } from '@/lib/membro';
import { ListaCasas } from './ListaCasas';

export default async function Casas({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const repo = getRepo();
  const dono = await repo.membroPorCodigo(codigo);
  if (!dono) notFound();
  await exigirMembro(`/c/${dono.codigo}/casas`);
  const casas = await repo.casas(true);

  return (
    <Page>
      <Topbar />
      <div className="screen">
        <div>
          <h1 className="title" style={{ marginBottom: 10 }}>Escolha onde vai criar sua conta</h1>
          <p className="body">Todas são casas parceiras do clube. Escolha uma em que você ainda não tem conta.</p>
        </div>
        {casas.length ? (
          <ListaCasas codigo={dono.codigo} casas={casas.map((c) => ({ slug: c.slug, nome: c.nome, logo: c.logo_url, bonus: c.bonus_amigo }))} />
        ) : (
          <div className="rank-empty" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>Nenhuma casa parceira disponível agora. Volte em breve.</div>
        )}
        <div className="note">Vai abrir em nova aba. Depois de criar a conta e fazer o primeiro depósito, volte aqui para enviar o comprovante.</div>
      </div>
      <RodapeCompacto />
    </Page>
  );
}
