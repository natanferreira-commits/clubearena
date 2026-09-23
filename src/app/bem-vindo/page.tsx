import Link from 'next/link';
import { BotaoWhatsApp, CopiarLink } from '@/components/Compartilhar';
import { Page, RodapeCompacto, Topbar } from '@/components/Shell';
import { REGRAS, linkConvite, linkConviteCurto } from '@/lib/config';
import { mensagemConvite } from '@/lib/copy';
import { brl, mascararPix } from '@/lib/format';
import { exigirMembro } from '@/lib/membro';

export default async function BemVindo() {
  const m = await exigirMembro('/bem-vindo');
  return (
    <Page>
      <Topbar direita={<Link href="/painel" className="topbar-link">Meu painel</Link>} />
      <div className="screen">
        <div>
          <div className="ok-circle" style={{ marginBottom: 18 }}>✓</div>
          <h1 className="title" style={{ marginBottom: 10 }}>Bem-vindo ao clube, {m.apelido}.</h1>
          <p className="body">
            Este é o seu convite. Cada amigo que entrar por ele e fizer o primeiro depósito vale {brl(REGRAS.valorPorAmigo)} no seu PIX.
          </p>
        </div>
        <div className="stack gap-10">
          <CopiarLink url={linkConvite(m.codigo)} curto={linkConviteCurto(m.codigo)} codigo={m.codigo} />
          <BotaoWhatsApp mensagem={mensagemConvite(m.apelido, m.codigo)} />
        </div>
        <div className="stack">
          <div className="row"><span>Seu código</span><span className="mono">{m.codigo}</span></div>
          <div className="row"><span>Por amigo confirmado</span><span>{brl(REGRAS.valorPorAmigo)}</span></div>
          <div className="row">
            <span>Chave PIX</span>
            <span>{m.chave_pix ? mascararPix(m.tipo_pix, m.chave_pix) : <Link href="/painel/pix" className="u">Informar agora</Link>}</span>
          </div>
        </div>
        <div className="push-bottom stack gap-10">
          <Link href="/painel" className="btn btn-outline">Ir para o meu painel</Link>
          <div className="caption">
            O convite vale para quem ainda não tem conta na casa parceira. A recompensa fica em análise por {REGRAS.holdDias} dias depois da validação.
          </div>
        </div>
      </div>
      <RodapeCompacto />
    </Page>
  );
}
