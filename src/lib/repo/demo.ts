import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Casa, Conversao, Evento, Membro, Otp, Payout, Repo } from './types';

// Modo demonstração: tudo em memória, com dados de exemplo.
// Serve pra ver o app rodando sem Supabase. Reinicia a cada deploy/restart.

type Estado = {
  membros: Membro[];
  casas: Casa[];
  conversoes: Conversao[];
  payouts: Payout[];
  eventos: Evento[];
  otps: Otp[];
  arquivos: Map<string, string>; // caminho -> data URL
};

const g = globalThis as unknown as { __clubeDemo?: Estado };

const agora = () => new Date().toISOString();
const atras = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

function membroBase(p: Partial<Membro> & Pick<Membro, 'apelido' | 'codigo' | 'telefone'>): Membro {
  return {
    id: randomUUID(), indicado_por: null, criado_em: atras(24 * 20), ultimo_login: null, fingerprint: null, ip_cadastro: null,
    flag_fraude: null, tipo_pix: null, chave_pix: null, titular_pix: null, pix_atualizado_em: null, ...p,
  };
}

function conversaoBase(p: Partial<Conversao> & Pick<Conversao, 'convidado_id'>): Conversao {
  return {
    id: randomUUID(), indicador_id: null, casa_id: null, status: 'aguardando_comprovante', comprovante_cadastro_url: null,
    comprovante_ftd_url: null, valor_ftd: null, motivo_rejeicao: null, criada_em: agora(), enviada_em: null, validada_em: null,
    validada_por: null, payout_id: null, lembrete_30_em: null, lembrete_24h_em: null, ...p,
  };
}

// Print de exemplo (SVG) para a fila de validação.
function printExemplo(titulo: string, linha: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640"><rect width="360" height="640" fill="#f6f6f4"/><rect x="24" y="80" width="312" height="200" rx="14" fill="#fff" stroke="#d6d6d2"/><text x="44" y="130" font-family="sans-serif" font-size="20" font-weight="600" fill="#141414">${titulo}</text><text x="44" y="170" font-family="sans-serif" font-size="16" fill="#4a4a46">${linha}</text><text x="44" y="250" font-family="sans-serif" font-size="12" fill="#9a9a94">exemplo — modo demonstração</text></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function semear(): Estado {
  const casas: Casa[] = [
    { id: randomUUID(), nome: 'Casa Alfa', slug: 'alfa', logo_url: null, link_afiliado: 'https://example.com/?ref=alfa', bonus_amigo: 'R$ 20 em aposta grátis no primeiro depósito', cpa_valor: 150, ativa: true, ordem: 1 },
    { id: randomUUID(), nome: 'Casa Beta', slug: 'beta', logo_url: null, link_afiliado: 'https://example.com/?ref=beta', bonus_amigo: '30 dias de acesso ao grupo VIP', cpa_valor: 120, ativa: true, ordem: 2 },
    { id: randomUUID(), nome: 'Casa Gama', slug: 'gama', logo_url: null, link_afiliado: 'https://example.com/?ref=gama', bonus_amigo: 'Bilhete premium no bolão da semana', cpa_valor: 100, ativa: true, ordem: 3 },
  ];
  const nomes: [string, number][] = [['RafaFlu', 11], ['Mika_SP', 7], ['Thiagao', 5], ['joao7x', 4], ['Luh.bets', 3], ['DudaRJ', 2], ['caio_10', 1]];
  const membros: Membro[] = [];
  const conversoes: Conversao[] = [];
  let tel = 11990000000;
  for (const [apelido, qtd] of nomes) {
    const m = membroBase({ apelido, codigo: apelido.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + 'X', telefone: '55' + tel++ });
    if (apelido === 'joao7x') Object.assign(m, { tipo_pix: 'cpf', chave_pix: '12345678900', titular_pix: 'João da Silva', pix_atualizado_em: atras(24 * 15) });
    membros.push(m);
    for (let i = 0; i < qtd; i++) {
      const amigo = membroBase({ apelido: `${apelido.slice(0, 4)}_amigo${i + 1}`, codigo: `A${m.codigo.slice(0, 3)}${i}Z`, telefone: '55' + tel++, indicado_por: m.id });
      membros.push(amigo);
      const horas = 24 * (1 + ((i * 3 + apelido.length) % 18));
      conversoes.push(conversaoBase({
        convidado_id: amigo.id, indicador_id: m.id, casa_id: casas[i % 3].id, status: 'validada', valor_ftd: 30 + ((i * 17) % 90),
        criada_em: atras(horas + 30), enviada_em: atras(horas + 20), validada_em: atras(horas), validada_por: 'admin',
      }));
    }
  }
  // Fila de validação e funil do joao7x
  const joao = membros.find((m) => m.apelido === 'joao7x')!;
  const arquivos = new Map<string, string>();
  const pendentes: [string, number, number][] = [['bia.souza', 5, 45], ['pedrinho', 30, 30], ['marcos_rj', 52, 20]];
  for (const [apelido, horas, valor] of pendentes) {
    const amigo = membroBase({ apelido, codigo: apelido.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) + '9', telefone: '55' + tel++, indicado_por: joao.id, criado_em: atras(horas + 2) });
    membros.push(amigo);
    const c1 = `demo/${amigo.id}-cadastro.svg`;
    const c2 = `demo/${amigo.id}-ftd.svg`;
    arquivos.set(c1, printExemplo('Conta criada', `Bem-vindo, ${apelido}`));
    arquivos.set(c2, printExemplo('Depósito confirmado', `R$ ${valor},00`));
    conversoes.push(conversaoBase({
      convidado_id: amigo.id, indicador_id: joao.id, casa_id: casas[horas % 3].id, status: 'pendente', valor_ftd: valor,
      comprovante_cadastro_url: c1, comprovante_ftd_url: c2, criada_em: atras(horas + 1), enviada_em: atras(horas),
    }));
  }
  const semPrint = membroBase({ apelido: 'lucas.bet', codigo: 'LUCAS4', telefone: '55' + tel++, indicado_por: joao.id, criado_em: atras(3) });
  membros.push(semPrint);
  conversoes.push(conversaoBase({ convidado_id: semPrint.id, indicador_id: joao.id, casa_id: casas[0].id, criada_em: atras(2) }));
  membros.push(membroBase({ apelido: 'ana.paula', codigo: 'ANAPA2', telefone: '55' + tel++, indicado_por: joao.id, criado_em: atras(1) }));

  const eventos: Evento[] = [];
  let id = 1;
  for (let i = 0; i < 40; i++) eventos.push({ id: id++, criado_em: atras(i * 7), membro_id: null, evento: 'convite_click', meta: null });

  return { membros, casas, conversoes, payouts: [], eventos, otps: [], arquivos };
}

function estado(): Estado {
  if (!g.__clubeDemo) g.__clubeDemo = semear();
  return g.__clubeDemo;
}

export function criarRepoDemo(): Repo {
  const s = estado();
  const copia = <T>(v: T): T => (v === null || v === undefined ? v : structuredClone(v));

  return {
    modo: 'demo',

    async membroPorId(id) { return copia(s.membros.find((m) => m.id === id) ?? null); },
    async membroPorTelefone(t) { return copia(s.membros.find((m) => m.telefone === t) ?? null); },
    async membroPorCodigo(c) { return copia(s.membros.find((m) => m.codigo === c.toUpperCase()) ?? null); },
    async membrosPorIds(ids) { return copia(s.membros.filter((m) => ids.includes(m.id))); },
    async criarMembro(m) {
      if (s.membros.some((x) => x.telefone === m.telefone)) throw new Error('duplicate key telefone');
      if (s.membros.some((x) => x.codigo === m.codigo)) throw new Error('duplicate key codigo');
      const novo = membroBase({ ...m, criado_em: agora() });
      s.membros.push(novo);
      return copia(novo);
    },
    async atualizarMembro(id, dados) { Object.assign(s.membros.find((m) => m.id === id) ?? {}, dados); },
    async contarMembros(desde) { return s.membros.filter((m) => !desde || new Date(m.criado_em) >= desde).length; },
    async contarConvidadosDe(id) { return s.membros.filter((m) => m.indicado_por === id).length; },
    async convidadosDe(id, limite) {
      return copia(s.membros.filter((m) => m.indicado_por === id).sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, limite));
    },

    async casas(somenteAtivas) {
      return copia(s.casas.filter((c) => !somenteAtivas || c.ativa).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)));
    },
    async casaPorSlug(slug) { return copia(s.casas.find((c) => c.slug === slug) ?? null); },
    async salvarCasa(c) {
      const atual = c.id ? s.casas.find((x) => x.id === c.id) : null;
      if (atual) Object.assign(atual, c);
      else s.casas.push({ ...c, id: randomUUID() });
    },

    async conversaoPorId(id) { return copia(s.conversoes.find((c) => c.id === id) ?? null); },
    async conversoes(f) {
      return copia(
        s.conversoes
          .filter((c) => !f.indicadorId || c.indicador_id === f.indicadorId)
          .filter((c) => !f.convidadoId || c.convidado_id === f.convidadoId)
          .filter((c) => !f.status || f.status.includes(c.status))
          .filter((c) => !f.desde || new Date(c.criada_em) >= f.desde)
          .filter((c) => !f.validadaEntre || (!!c.validada_em && new Date(c.validada_em) >= f.validadaEntre[0] && new Date(c.validada_em) < f.validadaEntre[1]))
          .sort((a, b) => b.criada_em.localeCompare(a.criada_em)),
      );
    },
    async criarConversao(c) {
      const nova = conversaoBase(c);
      s.conversoes.push(nova);
      return copia(nova);
    },
    async atualizarConversao(id, dados) { Object.assign(s.conversoes.find((c) => c.id === id) ?? {}, dados); },

    async payouts(membroId) {
      return copia(s.payouts.filter((p) => !membroId || p.membro_id === membroId).sort((a, b) => b.criado_em.localeCompare(a.criado_em)));
    },
    async criarPayout(p) {
      const novo: Payout = { ...p, id: randomUUID(), criado_em: agora() };
      s.payouts.push(novo);
      return copia(novo);
    },

    async registrarEvento(e) {
      s.eventos.push({ id: s.eventos.length + 1, criado_em: agora(), membro_id: e.membro_id ?? null, evento: e.evento, meta: e.meta ?? null });
    },
    async contarEventos(evento, desde) { return s.eventos.filter((e) => e.evento === evento && new Date(e.criado_em) >= desde).length; },

    async salvarOtp(o) { s.otps = s.otps.filter((x) => x.telefone !== o.telefone).concat(o); },
    async otp(t) { return copia(s.otps.find((o) => o.telefone === t) ?? null); },
    async apagarOtp(t) { s.otps = s.otps.filter((o) => o.telefone !== t); },

    async subirArquivo(caminho, dados, contentType) {
      s.arquivos.set(caminho, `data:${contentType};base64,${Buffer.from(dados).toString('base64')}`);
      return caminho;
    },
    async urlArquivo(caminho) { return s.arquivos.get(caminho) ?? null; },
  };
}
