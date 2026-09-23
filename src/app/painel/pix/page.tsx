import { Page, RodapeCompacto, Topbar } from '@/components/Shell';
import { exigirMembro } from '@/lib/membro';
import { PixPainel } from './PixPainel';

export default async function PixPage() {
  const m = await exigirMembro('/painel/pix');
  return (
    <Page>
      <Topbar />
      <div className="screen">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Recompensa do clube</div>
          <h1 className="title" style={{ marginBottom: 10 }}>{m.chave_pix ? 'Alterar chave PIX' : 'Onde você recebe a recompensa'}</h1>
          <p className="body">A chave precisa estar no seu nome.</p>
        </div>
        <PixPainel inicial={{ tipo: m.tipo_pix, titular: m.titular_pix }} />
      </div>
      <RodapeCompacto />
    </Page>
  );
}
