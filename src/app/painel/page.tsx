import Link from 'next/link';
import { BotaoWhatsApp, CopiarLink } from '@/components/Compartilhar';
import { Page, Rodape, Topbar } from '@/components/Shell';
import { resumoMembro } from '@/lib/clube';
import { REGRAS, linkConvite, linkConviteCurto } from '@/lib/config';
import { mensagemConvite } from '@/lib/copy';
import { brl, dataCurta, iniciais, mascararPix } from '@/lib/format';
import { exigirMembro } from '@/lib/membro';

export default async function Painel() {
  const m = await exigirMembro('/painel');
  const r = await resumoMembro(m);

  return (
    <Page>
      <Topbar direita={<Link href="/sair" className="topbar-link">Sair</Link>} />
      <div className="screen" style={{ gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar">{iniciais(m.apelido)}</div>
          <div>
            <div className="heading">{m.apelido}</div>
            <div className="caption">
              Membro <span className="mono">{m.codigo}</span>
              {r.nivelMes && <> · {r.nivelMes} este mês</>}
            </div>
          </div>
        </div>

        <div className="stack gap-10">
          <div className="saldo">
            <div>
              <div className="caption">Em análise</div>
              <div className="saldo-v num">{brl(r.pendente)}</div>
            </div>
            <div>
              <div className="caption">Disponível para PIX</div>
              <div className="saldo-v num">{brl(r.disponivel)}</div>
            </div>
          </div>
          <div className="caption">
            {r.recebido > 0 && <>Você já recebeu {brl(r.recebido)}. </>}
            O PIX é enviado pela equipe do clube depois da análise de {REGRAS.holdDias} dias.
          </div>
        </div>

        <div className="stats">
          <div><div className="stats-v num">{r.amigos}</div><div className="caption">amigos no clube</div></div>
          <div><div className="stats-v num">{r.confirmados}</div><div className="caption">confirmados</div></div>
          <div><div className="stats-v num">{r.pixRecebidos}</div><div className="caption">PIX recebidos</div></div>
        </div>

        {r.validadosMes > 0 && (
          <div className="caption">
            <span className="accent">★</span>{' '}
            {r.faltamBonus > 0
              ? `Faltam ${r.faltamBonus} ${r.faltamBonus === 1 ? 'amigo confirmado' : 'amigos confirmados'} este mês para o bônus surpresa.`
              : `Você chegou a ${REGRAS.metaBonus} amigos este mês. O bônus surpresa entra junto com o próximo PIX.`}
          </div>
        )}

        <div className="stack gap-10">
          <h2 className="heading">Seu convite</h2>
          <CopiarLink url={linkConvite(m.codigo)} curto={linkConviteCurto(m.codigo)} codigo={m.codigo} />
          <BotaoWhatsApp mensagem={mensagemConvite(m.apelido, m.codigo)} />
        </div>

        <div className="stack">
          <h2 className="heading" style={{ marginBottom: 6 }}>Últimos convites</h2>
          {r.ultimos.length === 0 ? (
            <div className="rank-empty" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
              Nenhum amigo entrou pelo seu convite ainda. Compartilhe o link com quem ainda não tem conta.
            </div>
          ) : (
            r.ultimos.map((u) => (
              <div className="row" key={u.apelido + u.desde} style={{ alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-900)' }}>
                  {u.apelido} <span className="caption">· {dataCurta(u.desde)}</span>
                </span>
                <span>
                  <span className={`tag ${u.tom === 'neutro' ? '' : u.tom}`}>{u.rotulo}</span>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="stack">
          <div className="row">
            <span>Chave PIX</span>
            <span>
              {mascararPix(m.tipo_pix, m.chave_pix)} · <Link href="/painel/pix" className="u">{m.chave_pix ? 'Alterar' : 'Informar'}</Link>
            </span>
          </div>
          <div className="row">
            <span>Ranking do mês</span>
            <span><Link href="/ranking" className="u">Ver ranking</Link></span>
          </div>
        </div>
      </div>
      <Rodape />
    </Page>
  );
}
