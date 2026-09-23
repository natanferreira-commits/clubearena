import Link from 'next/link';
import { Page, RodapeCompacto, Topbar } from '@/components/Shell';
import { REGRAS } from '@/lib/config';
import { brl } from '@/lib/format';

export default function Enviado() {
  return (
    <Page>
      <Topbar />
      <div className="screen">
        <div>
          <div className="ok-circle" style={{ marginBottom: 18 }}>✓</div>
          <h1 className="title" style={{ marginBottom: 10 }}>Comprovante recebido.</h1>
          <p className="body">Vamos validar em até {REGRAS.slaHoras} h. Você recebe a confirmação no WhatsApp.</p>
        </div>
        <div className="block">
          <div className="label-caps" style={{ marginBottom: 8 }}>Agora é a sua vez</div>
          <div className="body">
            Você também tem um convite pessoal. Cada amigo que entrar por ele e for confirmado vale {brl(REGRAS.valorPorAmigo)} de recompensa do clube.
          </div>
        </div>
        <div className="push-bottom">
          <Link href="/painel" className="btn btn-primary">Convidar outro amigo</Link>
        </div>
      </div>
      <RodapeCompacto />
    </Page>
  );
}
