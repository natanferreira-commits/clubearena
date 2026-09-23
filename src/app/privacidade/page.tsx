import { Page, Rodape, Topbar } from '@/components/Shell';

const ITENS = [
  'Guardamos seu WhatsApp, apelido e, se você informar, sua chave PIX e o nome do titular.',
  'Os prints enviados ficam em armazenamento privado e só a equipe do clube tem acesso, para validar o cadastro.',
  'Registramos o aparelho e o IP do cadastro para evitar fraudes.',
  'Seu WhatsApp é usado para confirmações do clube. Não mandamos mensagem sem você pedir e não vendemos seus dados.',
  'Para apagar seus dados, peça pela conversa do Clube Arena no WhatsApp.',
];

export default function Privacidade() {
  return (
    <Page>
      <Topbar />
      <div className="screen" style={{ gap: 8 }}>
        <h1 className="title" style={{ marginBottom: 16 }}>Privacidade</h1>
        {ITENS.map((i) => (
          <div className="hairline-item" key={i}>{i}</div>
        ))}
      </div>
      <Rodape />
    </Page>
  );
}
