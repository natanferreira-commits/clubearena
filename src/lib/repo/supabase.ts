import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Casa, Conversao, Membro, Otp, Payout, Repo } from './types';

const BUCKET = 'comprovantes';

function ok<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

export function criarRepoSupabase(url: string, key: string): Repo {
  const db: SupabaseClient = createClient(url, key, { auth: { persistSession: false } });
  const numero = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  const conv = (c: Conversao): Conversao => ({ ...c, valor_ftd: numero(c.valor_ftd) });
  const casa = (c: Casa): Casa => ({ ...c, cpa_valor: numero(c.cpa_valor) });

  return {
    modo: 'supabase',

    async membroPorId(id) {
      return ok(await db.from('clube_membros').select('*').eq('id', id).maybeSingle()) as Membro | null;
    },
    async membroPorTelefone(telefone) {
      return ok(await db.from('clube_membros').select('*').eq('telefone', telefone).maybeSingle()) as Membro | null;
    },
    async membroPorCodigo(codigo) {
      return ok(await db.from('clube_membros').select('*').eq('codigo', codigo.toUpperCase()).maybeSingle()) as Membro | null;
    },
    async membrosPorIds(ids) {
      if (!ids.length) return [];
      return ok(await db.from('clube_membros').select('*').in('id', ids)) as Membro[];
    },
    async criarMembro(m) {
      return ok(await db.from('clube_membros').insert(m).select('*').single()) as Membro;
    },
    async atualizarMembro(id, dados) {
      ok(await db.from('clube_membros').update(dados).eq('id', id));
    },
    async contarMembros(desde) {
      let q = db.from('clube_membros').select('id', { count: 'exact', head: true });
      if (desde) q = q.gte('criado_em', desde.toISOString());
      const r = await q;
      if (r.error) throw new Error(r.error.message);
      return r.count ?? 0;
    },
    async contarConvidadosDe(indicadorId) {
      const r = await db.from('clube_membros').select('id', { count: 'exact', head: true }).eq('indicado_por', indicadorId);
      if (r.error) throw new Error(r.error.message);
      return r.count ?? 0;
    },
    async convidadosDe(indicadorId, limite) {
      return ok(
        await db.from('clube_membros').select('*').eq('indicado_por', indicadorId).order('criado_em', { ascending: false }).limit(limite),
      ) as Membro[];
    },

    async casas(somenteAtivas) {
      let q = db.from('clube_casas').select('*').order('ordem').order('nome');
      if (somenteAtivas) q = q.eq('ativa', true);
      return (ok(await q) as Casa[]).map(casa);
    },
    async casaPorSlug(slug) {
      const c = ok(await db.from('clube_casas').select('*').eq('slug', slug).maybeSingle()) as Casa | null;
      return c && casa(c);
    },
    async salvarCasa(c) {
      if (c.id) ok(await db.from('clube_casas').update(c).eq('id', c.id));
      else ok(await db.from('clube_casas').insert(c));
    },

    async conversaoPorId(id) {
      const c = ok(await db.from('clube_conversoes').select('*').eq('id', id).maybeSingle()) as Conversao | null;
      return c && conv(c);
    },
    async conversoes(f) {
      let q = db.from('clube_conversoes').select('*').order('criada_em', { ascending: false });
      if (f.indicadorId) q = q.eq('indicador_id', f.indicadorId);
      if (f.convidadoId) q = q.eq('convidado_id', f.convidadoId);
      if (f.status) q = q.in('status', f.status);
      if (f.desde) q = q.gte('criada_em', f.desde.toISOString());
      if (f.validadaEntre) q = q.gte('validada_em', f.validadaEntre[0].toISOString()).lt('validada_em', f.validadaEntre[1].toISOString());
      return (ok(await q.limit(5000)) as Conversao[]).map(conv);
    },
    async criarConversao(c) {
      return conv(ok(await db.from('clube_conversoes').insert(c).select('*').single()) as Conversao);
    },
    async atualizarConversao(id, dados) {
      ok(await db.from('clube_conversoes').update(dados).eq('id', id));
    },

    async payouts(membroId) {
      let q = db.from('clube_payouts').select('*').order('criado_em', { ascending: false });
      if (membroId) q = q.eq('membro_id', membroId);
      return (ok(await q) as Payout[]).map((p) => ({ ...p, valor: Number(p.valor) }));
    },
    async criarPayout(p) {
      const r = ok(await db.from('clube_payouts').insert(p).select('*').single()) as Payout;
      return { ...r, valor: Number(r.valor) };
    },

    async registrarEvento(e) {
      // Tracking nunca derruba a página.
      const r = await db.from('clube_eventos').insert({ evento: e.evento, membro_id: e.membro_id ?? null, meta: e.meta ?? null });
      if (r.error) console.error('[evento]', r.error.message);
    },
    async contarEventos(evento, desde) {
      const r = await db.from('clube_eventos').select('id', { count: 'exact', head: true }).eq('evento', evento).gte('criado_em', desde.toISOString());
      if (r.error) throw new Error(r.error.message);
      return r.count ?? 0;
    },

    async salvarOtp(o) {
      ok(await db.from('clube_otp').upsert(o));
    },
    async otp(telefone) {
      return ok(await db.from('clube_otp').select('*').eq('telefone', telefone).maybeSingle()) as Otp | null;
    },
    async apagarOtp(telefone) {
      ok(await db.from('clube_otp').delete().eq('telefone', telefone));
    },

    async subirArquivo(caminho, dados, contentType) {
      const r = await db.storage.from(BUCKET).upload(caminho, dados, { contentType, upsert: false });
      if (r.error) throw new Error(r.error.message);
      return caminho;
    },
    async urlArquivo(caminho) {
      const r = await db.storage.from(BUCKET).createSignedUrl(caminho, 60 * 30);
      return r.error ? null : r.data.signedUrl;
    },
  };
}
