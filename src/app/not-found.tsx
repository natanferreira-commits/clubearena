import Link from 'next/link';
import { Page, RodapeCompacto, Topbar } from '@/components/Shell';

export default function NaoEncontrado() {
  return (
    <Page>
      <Topbar />
      <div className="screen">
        <div>
          <h1 className="title" style={{ marginBottom: 10 }}>Convite não encontrado.</h1>
          <p className="body">Confira o link com quem te convidou. Você também pode entrar no clube direto.</p>
        </div>
        <div className="push-bottom">
          <Link href="/" className="btn btn-primary">Conhecer o clube</Link>
        </div>
      </div>
      <RodapeCompacto />
    </Page>
  );
}
