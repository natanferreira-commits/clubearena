import { Page, Rodape, Topbar } from '@/components/Shell';
import { REGRAS } from '@/lib/config';
import { brl } from '@/lib/format';

const v = REGRAS;

const SECOES: { t: string; itens: string[]; id?: string }[] = [
  {
    t: 'O clube',
    itens: [
      'O Clube Arena é uma comunidade gratuita de membros maiores de 18 anos.',
      'Cada pessoa pode ter um único cadastro, vinculado a um número de WhatsApp.',
    ],
  },
  {
    t: 'Convites e recompensas',
    itens: [
      `Cada amigo que entrar pelo seu convite, criar a primeira conta numa casa parceira e fizer o primeiro depósito de pelo menos ${brl(v.ftdMinimo)} vale ${brl(v.valorPorAmigo)} de recompensa do clube.`,
      'O amigo precisa enviar os prints do cadastro e do depósito pelo site. A equipe do clube confere cada envio com a casa parceira.',
      `A validação sai em até ${v.slaHoras} h. Depois de validada, a recompensa fica em análise por ${v.holdDias} dias antes do pagamento.`,
      'O pagamento é feito via PIX, para uma chave no nome do membro. Conferimos o titular antes de cada pagamento.',
      `Cada membro pode receber até ${v.capMensal} recompensas por mês.`,
      'As recompensas do clube podem ser alteradas ou encerradas sem aviso prévio. Valores já validados são pagos.',
    ],
  },
  {
    t: 'O que não vale',
    itens: [
      'Convite para quem já tinha conta na casa parceira.',
      'Visitar ou usar o próprio convite, ou cadastrar amigos a partir do mesmo aparelho.',
      'Prints editados, de outra pessoa ou com valor diferente do depósito real.',
      'Envios suspeitos são recusados e o membro pode ser removido do clube.',
    ],
  },
  {
    t: 'Ajuda',
    id: 'ajuda',
    itens: [
      'Dúvidas sobre validação ou pagamento: responda a mensagem do Clube Arena no WhatsApp.',
      'Jogue com responsabilidade. Se sentir que perdeu o controle, procure ajuda.',
    ],
  },
];

export default function Regras() {
  return (
    <Page>
      <Topbar direita={<span />} />
      <div className="screen" style={{ gap: 8 }}>
        <h1 className="title" style={{ marginBottom: 8 }}>Regras do clube</h1>
        {SECOES.map((s) => (
          <div key={s.t} id={s.id} style={{ paddingTop: 24 }}>
            <h2 className="heading" style={{ marginBottom: 4 }}>{s.t}</h2>
            {s.itens.map((i) => (
              <div className="hairline-item" key={i}>{i}</div>
            ))}
          </div>
        ))}
      </div>
      <Rodape />
    </Page>
  );
}
