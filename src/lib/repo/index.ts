import 'server-only';
import { criarRepoDemo } from './demo';
import { criarRepoSupabase } from './supabase';
import type { Repo } from './types';

let repo: Repo | null = null;

/** Supabase quando configurado; senão, modo demonstração em memória. */
export function getRepo(): Repo {
  if (repo) return repo;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  repo = url && key ? criarRepoSupabase(url, key) : criarRepoDemo();
  return repo;
}

export type * from './types';
