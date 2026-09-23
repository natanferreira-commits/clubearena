import { redirect } from 'next/navigation';
import { CadastroForm } from '@/components/CadastroForm';
import { Page, RodapeCompacto } from '@/components/Shell';
import { OTP_ATIVO } from '@/lib/config';
import { destinoSeguro } from '@/lib/format';
import { membroLogadoId } from '@/lib/session';

export default async function Entrar({ searchParams }: { searchParams: Promise<{ modo?: string; next?: string }> }) {
  const { modo, next } = await searchParams;
  const login = modo === 'login';
  // Só no login: no cadastro, a server action loga o membro e a página re-renderiza
  // antes da etapa do PIX — redirecionar aqui pularia essa etapa.
  if (login && (await membroLogadoId())) redirect(destinoSeguro(next, '/painel'));

  return (
    <Page>
      <CadastroForm
        modo={login ? 'login' : 'cadastro'}
        destino={login ? destinoSeguro(next, '/painel') : '/bem-vindo'}
        pedirPix={!login}
        otp={OTP_ATIVO}
      />
      <RodapeCompacto />
    </Page>
  );
}
