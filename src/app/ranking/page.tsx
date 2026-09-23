import Link from 'next/link';
import { Page, Rodape, Topbar } from '@/components/Shell';
import { Ranking } from '@/components/Ranking';
import { ranking } from '@/lib/clube';
import { diasParaVirada, mesAnterior, mesChave, nomeMes } from '@/lib/format';
import { membroLogadoId } from '@/lib/session';

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes: filtro } = await searchParams;
  const atual = mesChave();
  const mes = filtro === 'anterior' ? mesAnterior(atual) : atual;
  const [linhas, eu] = await Promise.all([ranking(mes, 20), membroLogadoId()]);

  return (
    <Page>
      <Topbar direita={<Link href={eu ? '/painel' : '/entrar'} className="topbar-link">{eu ? 'Meu painel' : 'Entrar'}</Link>} />
      <div className="screen">
        <div>
          <h1 className="title" style={{ marginBottom: 10 }}>Ranking de {nomeMes(mes)}</h1>
          <p className="body">
            Membros com mais amigos confirmados no mês.{' '}
            {mes === atual ? `Zera no dia 1. Faltam ${diasParaVirada()} dias.` : 'Resultado final do mês.'}
          </p>
        </div>
        <div className="tabs">
          <Link href="/ranking" className={mes === atual ? 'on' : ''}>Este mês</Link>
          <Link href="/ranking?mes=anterior" className={mes !== atual ? 'on' : ''}>Mês anterior</Link>
        </div>
        <Ranking
          linhas={linhas}
          destaque={eu}
          vazio={mes === atual ? 'Ninguém foi confirmado ainda este mês. O primeiro lugar está vago.' : 'Sem registros nesse mês.'}
        />
        <p className="caption">
          Selos do mês: Bronze a partir de 1 amigo, Prata 3, Ouro 5, Diamante 10. Quem fecha o mês como Diamante leva o selo para o histórico.
        </p>
      </div>
      <Rodape />
    </Page>
  );
}
