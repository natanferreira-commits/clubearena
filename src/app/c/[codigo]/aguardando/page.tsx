import Link from 'next/link';
import { Page, Passos, RodapeCompacto, Topbar } from '@/components/Shell';
import { REGRAS } from '@/lib/config';
import { brl } from '@/lib/format';
import { getRepo } from '@/lib/repo';

export default async function Aguardando({ params, searchParams }: { params: Promise<{ codigo: string }>; searchParams: Promise<{ casa?: string }> }) {
  const [{ codigo }, { casa: slug }] = await Promise.all([params, searchParams]);
  const casa = slug ? await getRepo().casaPorSlug(slug) : null;

  return (
    <Page>
      <Topbar />
      <div className="screen">
        <div>
          <h1 className="title" style={{ marginBottom: 10 }}>Perfeito. Agora faça seu cadastro{casa ? ` na ${casa.nome}` : ''}.</h1>
          <p className="body">A casa abriu em outra aba. Tire os prints conforme for avançando.</p>
        </div>
        <Passos
          itens={[
            { t: 'Crie sua conta na casa', d: 'Tire um print da tela de confirmação, com seu nome ou e-mail aparecendo.' },
            { t: `Faça o primeiro depósito de pelo menos ${brl(REGRAS.ftdMinimo)}`, d: 'Tire um print do comprovante, com valor e data.' },
            { t: 'Volte aqui e envie os prints', d: `A validação sai em até ${REGRAS.slaHoras} h e você recebe a confirmação no WhatsApp.` },
          ]}
        />
        <div className="push-bottom stack gap-10">
          <Link href="/comprovante" className="btn btn-primary">Já cadastrei, quero enviar os prints</Link>
          <Link href={`/c/${codigo}/casas`} className="caption center u">A casa não abriu? Escolher de novo</Link>
        </div>
      </div>
      <RodapeCompacto />
    </Page>
  );
}
