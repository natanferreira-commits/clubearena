import { notFound, redirect } from 'next/navigation';
import { CadastroForm } from '@/components/CadastroForm';
import { Page, RodapeCompacto } from '@/components/Shell';
import { OTP_ATIVO } from '@/lib/config';
import { getRepo } from '@/lib/repo';
import { membroLogadoId } from '@/lib/session';

export default async function EntrarConvidado({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const dono = await getRepo().membroPorCodigo(codigo);
  if (!dono) notFound();
  if (await membroLogadoId()) redirect(`/c/${dono.codigo}/casas`);

  return (
    <Page>
      <CadastroForm
        modo="cadastro"
        convite={{ codigo: dono.codigo, apelido: dono.apelido }}
        destino={`/c/${dono.codigo}/casas`}
        pedirPix={false}
        otp={OTP_ATIVO}
      />
      <RodapeCompacto />
    </Page>
  );
}
