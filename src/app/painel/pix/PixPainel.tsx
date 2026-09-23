'use client';

import { useRouter } from 'next/navigation';
import { PixForm } from '@/components/PixForm';

export function PixPainel({ inicial }: { inicial: { tipo: string | null; titular: string | null } }) {
  const router = useRouter();
  return (
    <PixForm
      rotulo="Salvar chave"
      inicial={inicial}
      onPronto={() => {
        router.push('/painel');
        router.refresh();
      }}
      onPular={() => router.push('/painel')}
    />
  );
}
