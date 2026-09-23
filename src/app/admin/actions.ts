'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { marcarPago, rejeitarConversao, validarConversao } from '@/lib/clube';
import { getRepo } from '@/lib/repo';
import { adminLogado, deslogarAdmin, logarAdmin, senhaAdminConfere } from '@/lib/session';

async function exigirAdmin(): Promise<string> {
  const nome = await adminLogado();
  if (!nome) redirect('/admin');
  return nome;
}

export async function loginAdmin(_: unknown, fd: FormData): Promise<{ erro?: string }> {
  const nome = String(fd.get('nome') ?? '').trim();
  if (nome.length < 2) return { erro: 'Informe seu nome. Ele fica registrado em cada validação.' };
  if (!senhaAdminConfere(String(fd.get('senha') ?? ''))) return { erro: 'Senha incorreta.' };
  await logarAdmin(nome);
  redirect('/admin/dashboard');
}

export async function sairAdmin() {
  await deslogarAdmin();
  redirect('/admin');
}

export async function validar(id: string): Promise<{ erro?: string }> {
  const admin = await exigirAdmin();
  const r = await validarConversao(id, admin);
  revalidatePath('/admin', 'layout');
  return r;
}

export async function rejeitar(id: string, motivo: string): Promise<{ erro?: string }> {
  const admin = await exigirAdmin();
  if (motivo.trim().length < 3) return { erro: 'Informe o motivo. Ele é enviado ao convidado.' };
  const r = await rejeitarConversao(id, motivo.trim(), admin);
  revalidatePath('/admin', 'layout');
  return r;
}

export async function pagar(membroId: string, pix?: { tipo: string; chave: string; titular: string }): Promise<{ erro?: string }> {
  const admin = await exigirAdmin();
  const r = await marcarPago(membroId, admin, pix);
  revalidatePath('/admin', 'layout');
  return r;
}

export async function salvarCasa(_: unknown, fd: FormData): Promise<{ erro?: string; ok?: true }> {
  await exigirAdmin();
  const nome = String(fd.get('nome') ?? '').trim();
  const link = String(fd.get('link_afiliado') ?? '').trim();
  const slug = (String(fd.get('slug') ?? '').trim() || nome)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!nome || !slug) return { erro: 'Informe o nome da casa.' };
  if (!/^https?:\/\//.test(link)) return { erro: 'O link de cadastro precisa começar com https://' };
  const cpa = String(fd.get('cpa_valor') ?? '').replace(',', '.').trim();
  const id = String(fd.get('id') ?? '') || undefined;

  const repo = getRepo();
  const existente = await repo.casaPorSlug(slug);
  if (existente && existente.id !== id) return { erro: `Já existe uma casa com o identificador "${slug}".` };

  await repo.salvarCasa({
    id,
    nome,
    slug,
    link_afiliado: link,
    logo_url: String(fd.get('logo_url') ?? '').trim() || null,
    bonus_amigo: String(fd.get('bonus_amigo') ?? '').trim() || null,
    cpa_valor: cpa ? Number(cpa) : null,
    ativa: fd.get('ativa') === 'on',
    ordem: Number(fd.get('ordem') ?? 0) || 0,
  });
  revalidatePath('/admin/casas');
  return { ok: true };
}
