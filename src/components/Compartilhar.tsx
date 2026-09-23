'use client';

import { useState } from 'react';
import { registrarCompartilhou } from '@/app/acoes-publicas';

export function CopiarLink({ url, curto, codigo }: { url: string; curto: string; codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  const base = curto.slice(0, curto.length - codigo.length);
  return (
    <div className="link-box">
      <span className="mono">
        {base}
        <span className="accent">{codigo}</span>
      </span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            window.prompt('Copie seu convite:', url);
          }
          setCopiado(true);
          registrarCompartilhou('copiar');
          setTimeout(() => setCopiado(false), 1500);
        }}
      >
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

export function BotaoWhatsApp({ mensagem, className = 'btn btn-dark' }: { mensagem: string; className?: string }) {
  return (
    <a
      className={className}
      href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => registrarCompartilhou('whatsapp')}
    >
      Compartilhar no WhatsApp
    </a>
  );
}
