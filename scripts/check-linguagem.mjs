// Barra termos proibidos pelo PRD §7.4 em textos visíveis (src/app e src/components).
// Nomes de coluna do banco (indicado_por, indicador_id, link_afiliado) ficam de fora.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PROIBIDOS = [/\bindica(r|ção|çoes|ções|do|da)\b/i, /\breferral\b/i, /\bcomiss(ão|ões|ao)\b/i, /\bcommission\b/i, /programa de afilia/i, /\bafiliad[oa]s?\b/i, /pagamento por lead/i, /ganhar por conta nova/i];
const IGNORAR = [/indicado_por/, /indicador_id/, /link_afiliado/, /indicadorId/];

function arquivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : /\.(tsx?|mjs)$/.test(n) ? [p] : [];
  });
}

let erros = 0;
for (const f of [...arquivos('src/app'), ...arquivos('src/components'), 'src/lib/copy.ts', 'src/lib/clube.ts']) {
  readFileSync(f, 'utf8').split('\n').forEach((linha, i) => {
    const limpa = IGNORAR.reduce((l, r) => l.replace(new RegExp(r, 'g'), ''), linha);
    // só strings e JSX: ignora comentários de código
    if (/^\s*(\/\/|\*)/.test(limpa)) return;
    for (const r of PROIBIDOS) {
      if (r.test(limpa)) {
        console.log(`${f}:${i + 1}  "${limpa.trim().slice(0, 100)}"`);
        erros++;
      }
    }
  });
}
if (erros) {
  console.error(`\n${erros} ocorrência(s) de linguagem proibida (PRD §7.4).`);
  process.exit(1);
}
console.log('Linguagem ok.');
