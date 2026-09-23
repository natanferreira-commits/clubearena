import 'server-only';
import { createHash, randomInt } from 'node:crypto';
import { REGRAS, linkConvite } from './config';
import { brl, intervaloMes, mesChave, nomeMes } from './format';
import { getRepo, type Conversao, type Membro, type StatusConversao } from './repo';
import { enviarWhatsApp } from './zapi';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CONTAM = ['validada', 'paga'] as StatusConversao[];
const DIA = 86_400_000;

// ---------------------------------------------------------------- cadastro

async function gerarCodigo(apelido: string): Promise<string> {
  const repo = getRepo();
  const base = apelido.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'ARENA';
  for (let i = 0; i < 20; i++) {
    const sufixo = Array.from({ length: i < 10 ? 2 : 3 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
    const codigo = base + sufixo;
    if (!(await repo.membroPorCodigo(codigo))) return codigo;
  }
  throw new Error('Não foi possível gerar um código de convite');
}

export async function criarMembro(p: {
  telefone: string;
  apelido: string;
  convidadoPor: Membro | null;
  fingerprint: string | null;
  ip: string | null;
}): Promise<Membro> {
  const repo = getRepo();
  let flag: string | null = null;
  if (p.convidadoPor) {
    if (p.fingerprint && p.convidadoPor.fingerprint === p.fingerprint) flag = 'Mesmo dispositivo de quem convidou';
    else if (p.ip && p.convidadoPor.ip_cadastro === p.ip) flag = 'Mesmo IP de quem convidou';
  }
  const membro = await repo.criarMembro({
    telefone: p.telefone,
    apelido: p.apelido,
    codigo: await gerarCodigo(p.apelido),
    indicado_por: p.convidadoPor?.id ?? null,
    fingerprint: p.fingerprint,
    ip_cadastro: p.ip,
    flag_fraude: flag,
  });
  await repo.registrarEvento({ evento: 'cadastro', membro_id: membro.id, meta: { convidado_por: p.convidadoPor?.codigo ?? null } });
  return membro;
}

// ---------------------------------------------------------------- código por WhatsApp (OTP, desligado no MVP)

const hashCodigo = (tel: string, codigo: string) =>
  createHash('sha256').update(`${tel}:${codigo}:${process.env.SESSION_SECRET ?? 'dev'}`).digest('hex');

export async function enviarCodigo(telefone: string) {
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await getRepo().salvarOtp({ telefone, codigo_hash: hashCodigo(telefone, codigo), expira_em: new Date(Date.now() + 10 * 60_000).toISOString(), tentativas: 0 });
  await enviarWhatsApp(telefone, `Seu código do Clube Arena: ${codigo}. Vale por 10 minutos. Não compartilhe.`);
}

export async function conferirCodigo(telefone: string, codigo: string): Promise<boolean> {
  const repo = getRepo();
  const o = await repo.otp(telefone);
  if (!o || new Date(o.expira_em) < new Date() || o.tentativas >= 5) return false;
  if (o.codigo_hash !== hashCodigo(telefone, codigo)) {
    await repo.salvarOtp({ ...o, tentativas: o.tentativas + 1 });
    return false;
  }
  await repo.apagarOtp(telefone);
  return true;
}

// ---------------------------------------------------------------- painel do membro

export type StatusConvite = { apelido: string; desde: string; rotulo: string; tom: 'neutro' | 'ok' | 'erro' };

function rotuloStatus(c: Conversao | undefined): Omit<StatusConvite, 'apelido' | 'desde'> {
  if (!c) return { rotulo: 'Aguardando cadastro', tom: 'neutro' };
  switch (c.status) {
    case 'aguardando_comprovante': return { rotulo: 'Aguardando comprovante', tom: 'neutro' };
    case 'pendente': return { rotulo: 'Em validação', tom: 'neutro' };
    case 'validada': return { rotulo: 'Validado', tom: 'ok' };
    case 'paga': return { rotulo: 'Pago', tom: 'ok' };
    case 'rejeitada': return { rotulo: 'Não validado', tom: 'erro' };
  }
}

const liberada = (c: Conversao) => !!c.validada_em && Date.now() - new Date(c.validada_em).getTime() >= REGRAS.holdDias * DIA;

export async function resumoMembro(membro: Membro) {
  const repo = getRepo();
  const [conversoes, payouts, amigos, ultimos] = await Promise.all([
    repo.conversoes({ indicadorId: membro.id }),
    repo.payouts(membro.id),
    repo.contarConvidadosDe(membro.id),
    repo.convidadosDe(membro.id, 5),
  ]);
  const mes = mesChave();
  const [ini, fim] = intervaloMes(mes);
  const doMes = conversoes.filter((c) => CONTAM.includes(c.status) && c.validada_em && new Date(c.validada_em) >= ini && new Date(c.validada_em) < fim);

  const emAnalise = conversoes.filter((c) => c.status === 'pendente' || (c.status === 'validada' && !liberada(c))).length;
  const liberadas = conversoes.filter((c) => c.status === 'validada' && liberada(c)).length;
  const bonusDisponivel = await bonusPendente(membro.id, conversoes, payouts);

  // Última conversão de cada convidado define o status mostrado.
  const porConvidado = new Map<string, Conversao>();
  for (const c of conversoes) if (!porConvidado.has(c.convidado_id)) porConvidado.set(c.convidado_id, c);

  return {
    pendente: emAnalise * REGRAS.valorPorAmigo,
    disponivel: liberadas * REGRAS.valorPorAmigo + bonusDisponivel.reduce((s, b) => s + b.valor, 0),
    recebido: payouts.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valor, 0),
    amigos,
    confirmados: conversoes.filter((c) => CONTAM.includes(c.status)).length,
    pixRecebidos: payouts.filter((p) => p.status === 'pago').length,
    validadosMes: doMes.length,
    faltamBonus: Math.max(0, REGRAS.metaBonus - doMes.length),
    ultimos: ultimos.map((m) => ({ apelido: m.apelido, desde: m.criado_em, ...rotuloStatus(porConvidado.get(m.id)) })),
  };
}

/** Meses em que o membro bateu a meta e ainda não recebeu o bônus surpresa. */
async function bonusPendente(membroId: string, conversoes?: Conversao[], payouts?: Awaited<ReturnType<ReturnType<typeof getRepo>['payouts']>>) {
  const repo = getRepo();
  conversoes ??= await repo.conversoes({ indicadorId: membroId, status: CONTAM });
  payouts ??= await repo.payouts(membroId);
  const porMes = new Map<string, Conversao[]>();
  for (const c of conversoes) {
    if (!CONTAM.includes(c.status) || !c.validada_em) continue;
    const m = mesChave(new Date(c.validada_em));
    porMes.set(m, [...(porMes.get(m) ?? []), c]);
  }
  const pagos = new Set(payouts.filter((p) => p.tipo === 'bonus' && p.status === 'pago').map((p) => p.mes));
  return [...porMes.entries()]
    .filter(([mes, cs]) => cs.length >= REGRAS.metaBonus && !pagos.has(mes) && cs.every(liberada))
    .map(([mes]) => ({ mes, valor: REGRAS.bonusSurpresa }));
}

export async function membrosNoMes(): Promise<number> {
  return getRepo().contarMembros(intervaloMes(mesChave())[0]);
}

// ---------------------------------------------------------------- admin: validação

export async function validarConversao(id: string, admin: string): Promise<{ erro?: string }> {
  const repo = getRepo();
  const c = await repo.conversaoPorId(id);
  if (!c || c.status !== 'pendente') return { erro: 'Esse comprovante não está mais pendente.' };
  if (c.valor_ftd !== null && c.valor_ftd < REGRAS.ftdMinimo) return { erro: `Primeiro depósito abaixo de ${brl(REGRAS.ftdMinimo)}. Rejeite ou corrija o valor.` };
  if (c.indicador_id) {
    const doMes = await repo.conversoes({ indicadorId: c.indicador_id, status: CONTAM, validadaEntre: intervaloMes(mesChave()) });
    if (doMes.length >= REGRAS.capMensal) return { erro: `Quem convidou já tem ${REGRAS.capMensal} recompensas validadas este mês (limite do MVP).` };
  }
  await repo.atualizarConversao(id, { status: 'validada', validada_em: new Date().toISOString(), validada_por: admin, motivo_rejeicao: null });

  const [convidado, indicador] = await repo.membrosPorIds([c.convidado_id, c.indicador_id ?? '']).then((ms) => [
    ms.find((m) => m.id === c.convidado_id),
    ms.find((m) => m.id === c.indicador_id),
  ]);
  if (convidado) await enviarWhatsApp(convidado.telefone, `Clube Arena: seu comprovante foi aprovado. Bem-vindo! Seu convite pessoal já está no painel: ${linkConvite(convidado.codigo)}`);
  if (indicador && convidado) {
    await enviarWhatsApp(indicador.telefone, `Clube Arena: ${convidado.apelido} entrou pelo seu convite e foi confirmado. ${brl(REGRAS.valorPorAmigo)} ficam em análise por ${REGRAS.holdDias} dias e depois vão pro seu PIX.`);
  }
  return {};
}

export async function rejeitarConversao(id: string, motivo: string, admin: string): Promise<{ erro?: string }> {
  const repo = getRepo();
  const c = await repo.conversaoPorId(id);
  if (!c || c.status !== 'pendente') return { erro: 'Esse comprovante não está mais pendente.' };
  await repo.atualizarConversao(id, { status: 'rejeitada', motivo_rejeicao: motivo, validada_em: new Date().toISOString(), validada_por: admin });
  const convidado = await repo.membroPorId(c.convidado_id);
  if (convidado) await enviarWhatsApp(convidado.telefone, `Clube Arena: não conseguimos validar seu comprovante. Motivo: ${motivo}. Você pode enviar de novo pelo site.`);
  return {};
}

// ---------------------------------------------------------------- admin: payouts

export type ItemPagamento = {
  membro: Membro;
  conversoes: Conversao[];
  bonus: { mes: string; valor: number }[];
  total: number;
  pixRecente: boolean;
};

export async function pagamentosPendentes(): Promise<ItemPagamento[]> {
  const repo = getRepo();
  const validadas = (await repo.conversoes({ status: ['validada'] })).filter((c) => c.indicador_id && liberada(c));
  const porMembro = new Map<string, Conversao[]>();
  for (const c of validadas) porMembro.set(c.indicador_id!, [...(porMembro.get(c.indicador_id!) ?? []), c]);

  // Bônus pode estar pendente mesmo sem conversão liberada nova.
  const todasPagas = await repo.conversoes({ status: CONTAM });
  const candidatos = new Set([...porMembro.keys(), ...todasPagas.map((c) => c.indicador_id).filter((x): x is string => !!x)]);
  const membros = await repo.membrosPorIds([...candidatos]);

  const itens: ItemPagamento[] = [];
  for (const membro of membros) {
    const conversoes = porMembro.get(membro.id) ?? [];
    const bonus = await bonusPendente(membro.id, todasPagas.filter((c) => c.indicador_id === membro.id));
    if (!conversoes.length && !bonus.length) continue;
    itens.push({
      membro,
      conversoes,
      bonus,
      total: conversoes.length * REGRAS.valorPorAmigo + bonus.reduce((s, b) => s + b.valor, 0),
      pixRecente: !!membro.pix_atualizado_em && Date.now() - new Date(membro.pix_atualizado_em).getTime() < 7 * DIA,
    });
  }
  return itens.sort((a, b) => b.total - a.total);
}

export async function marcarPago(membroId: string, admin: string, pix?: { tipo: string; chave: string; titular: string }): Promise<{ erro?: string }> {
  const repo = getRepo();
  const item = (await pagamentosPendentes()).find((i) => i.membro.id === membroId);
  if (!item) return { erro: 'Nada pendente para esse membro.' };
  let chave = item.membro.chave_pix;
  if (pix?.chave) {
    await repo.atualizarMembro(membroId, { tipo_pix: pix.tipo, chave_pix: pix.chave, titular_pix: pix.titular || null, pix_atualizado_em: new Date().toISOString() });
    chave = pix.chave;
  }
  if (!chave) return { erro: 'Informe a chave PIX antes de marcar como pago.' };

  const agora = new Date().toISOString();
  const mes = mesChave();
  if (item.conversoes.length) {
    const p = await repo.criarPayout({
      membro_id: membroId, mes, tipo: 'convites', conversoes_ids: item.conversoes.map((c) => c.id),
      valor: item.conversoes.length * REGRAS.valorPorAmigo, chave_pix: chave, status: 'pago', pago_em: agora, pago_por: admin,
    });
    for (const c of item.conversoes) await repo.atualizarConversao(c.id, { status: 'paga', payout_id: p.id });
  }
  for (const b of item.bonus) {
    await repo.criarPayout({ membro_id: membroId, mes: b.mes, tipo: 'bonus', conversoes_ids: [], valor: b.valor, chave_pix: chave, status: 'pago', pago_em: agora, pago_por: admin });
  }
  await enviarWhatsApp(item.membro.telefone, `Clube Arena: enviamos ${brl(item.total)} para sua chave PIX. Obrigado por fazer o clube crescer.`);
  return {};
}

// ---------------------------------------------------------------- admin: dashboard

export async function metricasAdmin() {
  const repo = getRepo();
  const mes = mesChave();
  const [ini] = intervaloMes(mes);
  const desde30 = new Date(Date.now() - 30 * DIA);
  const [membros, membrosMes, recentes, validadasMes, pendentesFila, pagamentos, cliques] = await Promise.all([
    repo.contarMembros(),
    repo.contarMembros(ini),
    repo.conversoes({ desde: desde30 }),
    repo.conversoes({ status: CONTAM, validadaEntre: intervaloMes(mes) }),
    repo.conversoes({ status: ['pendente'] }),
    pagamentosPendentes(),
    repo.contarEventos('convite_click', ini),
  ]);
  const validadas30 = await repo.conversoes({ status: CONTAM, validadaEntre: [desde30, new Date()] });
  const porDia: { dia: string; n: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * DIA);
    const chave = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
    porDia.push({ dia: chave, n: 0 });
  }
  for (const c of validadas30) {
    const chave = new Date(c.validada_em!).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
    const d = porDia.find((x) => x.dia === chave);
    if (d) d.n++;
  }
  return {
    mesNome: nomeMes(mes),
    membros,
    membrosMes,
    cliquesMes: cliques,
    escolheramCasa30: recentes.length,
    validadasMes: validadasMes.length,
    fila: pendentesFila.length,
    filaAtrasada: pendentesFila.filter((c) => c.enviada_em && Date.now() - new Date(c.enviada_em).getTime() > 24 * 3_600_000).length,
    pixPendente: pagamentos.reduce((s, p) => s + p.total, 0),
    porDia,
  };
}
