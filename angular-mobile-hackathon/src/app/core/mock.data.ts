import { ANDARES, POSICOES_POR_ANDAR, RUAS, formatarEndereco } from './config';
import { Doca, NotaFiscal, Posicao, StatusPosicao, Usuario } from './models';

export const MOCK_USUARIO: Usuario = {
  id: 2,
  nome: 'Operador',
  perfil: 'OPERADOR',
  token: 'mock-token-gollinho-operador',
};

const MOCK_PRODUTOS = [
  { id: 1, sabor: 'Guaraná' },
  { id: 2, sabor: 'Laranja' },
  { id: 3, sabor: 'Caju' },
  { id: 4, sabor: 'Maçã' },
];

export const MOCK_DOCAS: Doca[] = [
  { id: 1, descricao: 'Doca 1' },
  { id: 2, descricao: 'Doca 2' },
  { id: 3, descricao: 'Doca 3' },
  { id: 4, descricao: 'Doca 4' },
];

/** mesma semente do angular-hackathon (retaguarda), pra bater na demo */
export const MOCK_NOTAS: NotaFiscal[] = [
  {
    id: 1,
    numero: '000123',
    serie: '1',
    fornecedor: 'Distribuidora Sul Ltda',
    dataEmissao: '2026-08-28',
    doca: MOCK_DOCAS[0],
    status: 'CONFERIDA',
    itens: [
      { produto: MOCK_PRODUTOS[0], fardosEsperados: 800, fardosConferidos: 800 },
      { produto: MOCK_PRODUTOS[1], fardosEsperados: 400, fardosConferidos: 400 },
    ],
  },
  {
    id: 2,
    numero: '000124',
    serie: '1',
    fornecedor: 'Bebidas Center SA',
    dataEmissao: '2026-08-29',
    doca: MOCK_DOCAS[2],
    status: 'AGUARDANDO_CONFERENCIA',
    itens: [{ produto: MOCK_PRODUTOS[2], fardosEsperados: 500, fardosConferidos: 0 }],
  },
  {
    id: 3,
    numero: '000125',
    serie: '2',
    fornecedor: 'Log Express Transportes',
    dataEmissao: '2026-08-29',
    doca: MOCK_DOCAS[1],
    status: 'DIVERGENTE',
    itens: [{ produto: MOCK_PRODUTOS[3], fardosEsperados: 700, fardosConferidos: 680 }],
  },
  {
    id: 4,
    numero: '000126',
    serie: '1',
    fornecedor: 'Distribuidora Sul Ltda',
    dataEmissao: '2026-08-29',
    doca: MOCK_DOCAS[0],
    status: 'AGUARDANDO_CONFERENCIA',
    itens: [
      { produto: MOCK_PRODUTOS[0], fardosEsperados: 300, fardosConferidos: 0 },
      { produto: MOCK_PRODUTOS[1], fardosEsperados: 200, fardosConferidos: 0 },
    ],
  },
];

/** 12 + 9 + 7 + 5 + 3 + 1 = 37 posicoes ocupadas — mesma semente da retaguarda,
 *  garante R01-A01-P01 e R01-A01-P02 já ocupadas (seção 8 da especificação). */
const OCUPADAS_POR_RUA = [12, 9, 7, 5, 3, 1];

function gerarPosicoes(): Posicao[] {
  const lista: Posicao[] = [];
  let id = 1;

  for (let rua = 1; rua <= RUAS; rua++) {
    let restantes = OCUPADAS_POR_RUA[rua - 1];

    for (let andar = 1; andar <= ANDARES; andar++) {
      for (let posicao = 1; posicao <= POSICOES_POR_ANDAR; posicao++) {
        let status: StatusPosicao = 'LIVRE';

        if (restantes > 0) {
          status = 'OCUPADA';
          restantes--;
        } else if (rua === 4 && andar === 4 && posicao > 6) {
          status = 'BLOQUEADA';
        }

        lista.push({
          id: id++,
          rua,
          andar,
          posicao,
          codigo: formatarEndereco(rua, andar, posicao),
          status,
          sabor: null,
        });
      }
    }
  }
  return lista;
}

export const MOCK_POSICOES: Posicao[] = gerarPosicoes();
