import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotaoWhatsApp, CopiarLink } from '@/components/Compartilhar';
import { Page, Passos, Rodape, Topbar } from '@/components/Shell';
import { membrosNoMes } from '@/lib/clube';
import { REGRAS, linkConvite, linkConviteCurto } from '@/lib/config';
import { mensagemConvite } from '@/lib/copy';
import { brl, iniciais } from '@/lib/format';
import { getRepo } from '@/lib/repo';
import { membroLogadoId } from '@/lib/session';

export default async function Convite({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const repo = getRepo();
  const [dono, eu, casas, noMes] = await Promise.all([repo.membroPorCodigo(codigo), membroLogadoId(), repo.casas(true), membrosNoMes()]);
  if (!dono) notFound();

  const proprio = eu === dono.id;
  if (!proprio) await repo.registrarEvento({ evento: 'convite_click', membro_id: dono.id, meta: { codigo: dono.codigo, logado: !!eu } });

  const nome = dono.apelido;
  const aceitar = eu ? `/c/${dono.codigo}/casas` : `/c/${dono.codigo}/entrar`;

  if (proprio) {
    return (
      <Page>
        <Topbar direita={<Link href="/painel" className="topbar-link">Meu painel</Link>} />
        <div className="screen">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Seu convite</div>
            <h1 className="title" style={{ marginBottom: 10 }}>Esta é a página que seus amigos veem.</h1>
            <p className="body">Visitas suas não contam. Compartilhe o link com quem ainda não tem conta na casa parceira.</p>
          </div>
          <div className="stack gap-10">
            <CopiarLink url={linkConvite(dono.codigo)} curto={linkConviteCurto(dono.codigo)} codigo={dono.codigo} />
            <BotaoWhatsApp mensagem={mensagemConvite(dono.apelido, dono.codigo)} />
          </div>
        </div>
        <Rodape />
      </Page>
    );
  }

  const faq = [
    { q: 'Preciso pagar para entrar no clube?', a: 'Não. O clube é gratuito. A oferta de boas-vindas vem da casa parceira quando você cria a conta e faz o primeiro depósito.' },
    { q: 'Já tenho conta na casa. O convite vale?', a: 'O convite é para quem ainda não tem conta. Mas você pode entrar no clube do mesmo jeito e convidar seus amigos.' },
    { q: `E ${nome}, ganha o quê?`, a: 'Uma recompensa do clube quando seu cadastro for confirmado. Nada sai do seu bolso.' },
  ];

  return (
    <Page>
      <Topbar />
      <div className="hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="avatar">{iniciais(nome)}</div>
          <div className="small" style={{ lineHeight: 1.35 }}>
            Convite de <span className="strong">{nome}</span>
            <br />
            membro do clube
          </div>
        </div>
        <h1 className="display" style={{ marginBottom: 16 }}>
          <span className="accent">{nome}</span> convidou você para o Clube Arena.
        </h1>
        <p className="lead" style={{ marginBottom: 28 }}>
          Escolha uma casa parceira, crie sua conta pelo convite e faça o primeiro depósito para garantir a oferta de boas-vindas.
        </p>
        <Link href={aceitar} className="btn btn-primary">Aceitar convite</Link>
        <div className="caption center" style={{ marginTop: 12 }}>
          {noMes >= 20 ? `${noMes} pessoas entraram no clube este mês. ` : ''}Maiores de 18.
        </div>
      </div>

      <div className="section" style={{ paddingTop: 8 }}>
        <h2 className="heading" style={{ marginBottom: 6 }}>O que você recebe</h2>
        <div className="stack">
          {casas.filter((c) => c.bonus_amigo).map((c) => (
            <div className="benefit" key={c.id}>
              <div className="benefit-mark">✓</div>
              <div>
                <div className="step-t">{c.bonus_amigo}</div>
                <div className="step-d">Oferta de boas-vindas na {c.nome}.</div>
              </div>
            </div>
          ))}
          <div className="benefit">
            <div className="benefit-mark">✓</div>
            <div>
              <div className="step-t">Seu próprio convite</div>
              <div className="step-d">Entrou no clube, já pode convidar e aparecer no ranking do mês.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="heading" style={{ marginBottom: 6 }}>Como funciona</h2>
        <Passos
          itens={[
            { t: 'Aceite o convite', d: 'Informe seu WhatsApp e um apelido. Leva 20 segundos.' },
            { t: 'Escolha a casa e crie sua conta', d: `Precisa ser sua primeira conta na casa. Faça o primeiro depósito, a partir de ${brl(REGRAS.ftdMinimo)}.` },
            { t: 'Envie os prints', d: `Volte aqui com o print do cadastro e do depósito. A validação sai em até ${REGRAS.slaHoras} h.` },
          ]}
        />
      </div>

      <div className="block" style={{ margin: '40px 24px 0' }}>
        <div className="label-caps" style={{ marginBottom: 8 }}>Depois, é a sua vez</div>
        <div className="body">
          Quem entra no clube também recebe um convite próprio. Cada amigo seu confirmado vale {brl(REGRAS.valorPorAmigo)} de recompensa do clube, direto no PIX.
        </div>
      </div>

      <div className="section">
        <h2 className="heading" style={{ marginBottom: 6 }}>Perguntas frequentes</h2>
        <div className="stack">
          {faq.map((f) => (
            <div className="faq-item" key={f.q}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{f.q}</div>
              <div className="small">{f.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section stack gap-10" style={{ paddingTop: 32 }}>
        <Link href={aceitar} className="btn btn-primary">Aceitar convite</Link>
        <Link href="/entrar" className="caption center u">Não conheço {nome}, quero entrar sozinho</Link>
      </div>

      <Rodape texto="O convite vale para novos clientes da casa parceira. As ofertas de boas-vindas seguem as regras de cada casa e as recompensas do clube podem ser alteradas sem aviso prévio." />
    </Page>
  );
}
