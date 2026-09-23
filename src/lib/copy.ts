import { REGRAS, linkConvite } from './config';
import { brl } from './format';

export const PASSOS_MEMBRO = [
  { t: 'Crie seu convite', d: 'Informe seu WhatsApp e um apelido. Você recebe um link pessoal.' },
  { t: 'Compartilhe com quem ainda não tem conta', d: 'No WhatsApp ou onde preferir. O convite só vale para novos clientes da casa parceira.' },
  { t: `Receba ${brl(REGRAS.valorPorAmigo)} por amigo`, d: 'Quando o amigo cria a conta, faz o primeiro depósito e o comprovante é validado, a recompensa vai para o seu PIX.' },
];

export const REGRAS_CONVITE = [
  'Só vale amigo que ainda não tinha conta na casa parceira.',
  `O primeiro depósito dele precisa ser de ${brl(REGRAS.ftdMinimo)} ou mais.`,
  `O comprovante é validado em até ${REGRAS.slaHoras} h e a recompensa fica em análise por ${REGRAS.holdDias} dias antes do PIX.`,
  `Até ${REGRAS.capMensal} recompensas por membro a cada mês.`,
];

export function mensagemConvite(apelido: string, codigo: string): string {
  return `Entrei no Clube Arena e estou te chamando. Entra pelo meu convite, cria sua conta numa casa parceira e já começa com o bônus de boas-vindas: ${linkConvite(codigo)}`;
}
