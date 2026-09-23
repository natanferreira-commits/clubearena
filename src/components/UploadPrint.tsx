'use client';

import { useRef, useState } from 'react';

/** Reduz o print para no máx. 1600 px e JPEG 0,82 (~200–400 KB) antes do envio. */
async function comprimir(arquivo: File): Promise<Blob> {
  if (!arquivo.type.startsWith('image/') || arquivo.type === 'image/gif') return arquivo;
  const bitmap = await createImageBitmap(arquivo).catch(() => null);
  if (!bitmap) return arquivo;
  const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((ok) => canvas.toBlob((b) => ok(b ?? arquivo), 'image/jpeg', 0.82));
}

export function UploadPrint({ titulo, dica, erro, onArquivo }: { titulo: string; dica: string; erro?: boolean; onArquivo: (b: Blob | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  return (
    <div
      className={`upload${preview ? ' filled' : ''}${erro && !preview ? ' erro' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
    >
      <div className="upload-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview ? <img src={preview} alt="" /> : '+'}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="step-t" style={{ fontSize: 15 }}>{titulo}</div>
        <div className="step-d">{processando ? 'Preparando…' : preview ? 'Toque para trocar' : dica}</div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setProcessando(true);
          const b = await comprimir(f);
          setProcessando(false);
          if (preview) URL.revokeObjectURL(preview);
          setPreview(URL.createObjectURL(b));
          onArquivo(b);
        }}
      />
    </div>
  );
}
