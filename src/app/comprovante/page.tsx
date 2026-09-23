import Link from 'next/link';
import { Page, RodapeCompacto, Topbar } from '@/components/Shell';
import { REGRAS } from '@/lib/config';
import { getRepo } from '@/lib/repo';
import { exigirMembro } from '@/lib/membro';
import { ComprovanteForm } from './ComprovanteForm';

export default async function Comprovante() {
  const m = await exigirMembro('/comprovante');
  const repo = getRepo();
  const [casas, conversoes, quemConvidou] = await Promise.all([
    repo.casas(true),
    repo.conversoes({ convidadoId: m.id }),
    m.indicado_por ? repo.membroPorId(m.indicado_por) : null,
  ]);

  const emValidacao = conversoes.find((c) => c.status === 'pendente');
  const confirmada = conversoes.find((c) => c.status === 'validada' || c.status === 'paga');
  const rejeitada = conversoes[0]?.status === 'rejeitada' ? conversoes[0] : null;
  const aberta = conversoes.find((c) => c.status === 'aguardando_comprovante') ?? rejeitada;
  const casaInicial = casas.find((c) => c.id === aberta?.casa_id)?.slug ?? null;

  if (emValidacao || confirmada) {
    return (
      <Page>
        <Topbar direita={<Link href="/painel" className="topbar-link">Meu painel</Link>} />
        <div className="screen">
          <div>
            <h1 className="title" style={{ marginBottom: 10 }}>{confirmada ? 'Seu cadastro já foi confirmado.' : 'Seu comprovante está em validação.'}</h1>
            <p className="body">
              {confirmada
                ? 'Agora é a sua vez: convide amigos e receba a recompensa do clube por cada um.'
                : `A validação sai em até ${REGRAS.slaHoras} h. Você recebe a resposta no WhatsApp.`}
            </p>
          </div>
          <div className="push-bottom">
            <Link href="/painel" className="btn btn-primary">Convidar amigos</Link>
          </div>
        </div>
        <RodapeCompacto />
      </Page>
    );
  }

  return (
    <Page>
      <Topbar />
      <div className="screen">
        <div>
          <h1 className="title" style={{ marginBottom: 10 }}>
            {quemConvidou ? `Envie os prints para confirmar o convite de ${quemConvidou.apelido}` : 'Envie os prints do seu cadastro'}
          </h1>
          <p className="body">Precisamos de dois prints: a conta criada e o primeiro depósito, de pelo menos R$ {REGRAS.ftdMinimo}.</p>
        </div>
        {rejeitada?.motivo_rejeicao && (
          <div className="toast erro">Seu último envio não foi validado: {rejeitada.motivo_rejeicao}. Envie de novo.</div>
        )}
        <ComprovanteForm casas={casas.map((c) => ({ slug: c.slug, nome: c.nome }))} casaInicial={casaInicial} slaHoras={REGRAS.slaHoras} />
      </div>
      <RodapeCompacto />
    </Page>
  );
}
