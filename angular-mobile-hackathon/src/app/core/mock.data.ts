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
    docaId: MOCK_DOCAS[0].id,
    status: 'CONFERIDA',
    itens: [
      { id: 1, produtoId: MOCK_PRODUTOS[0].id, sabor: MOCK_PRODUTOS[0].sabor, fardosEsperados: 800, fardosConferidos: 800 },
      { id: 2, produtoId: MOCK_PRODUTOS[1].id, sabor: MOCK_PRODUTOS[1].sabor, fardosEsperados: 400, fardosConferidos: 400 },
    ],
    observacao: null,
  },
  {
    id: 2,
    numero: '000124',
    serie: '1',
    fornecedor: 'Bebidas Center SA',
    dataEmissao: '2026-08-29',
    docaId: MOCK_DOCAS[2].id,
    status: 'AGUARDANDO_CONFERENCIA',
    itens: [{ id: 3, produtoId: MOCK_PRODUTOS[2].id, sabor: MOCK_PRODUTOS[2].sabor, fardosEsperados: 500, fardosConferidos: 0 }],
    observacao: null,
  },
  {
    id: 3,
    numero: '000125',
    serie: '2',
    fornecedor: 'Log Express Transportes',
    dataEmissao: '2026-08-29',
    docaId: MOCK_DOCAS[1].id,
    status: 'DIVERGENTE',
    itens: [{ id: 4, produtoId: MOCK_PRODUTOS[3].id, sabor: MOCK_PRODUTOS[3].sabor, fardosEsperados: 700, fardosConferidos: 680 }],
    observacao: 'Divergência confirmada pelo operador.',
  },
  {
    id: 4,
    numero: '000126',
    serie: '1',
    fornecedor: 'Distribuidora Sul Ltda',
    dataEmissao: '2026-08-29',
    docaId: MOCK_DOCAS[0].id,
    status: 'AGUARDANDO_CONFERENCIA',
    itens: [
      { id: 5, produtoId: MOCK_PRODUTOS[0].id, sabor: MOCK_PRODUTOS[0].sabor, fardosEsperados: 300, fardosConferidos: 0 },
      { id: 6, produtoId: MOCK_PRODUTOS[1].id, sabor: MOCK_PRODUTOS[1].sabor, fardosEsperados: 200, fardosConferidos: 0 },
    ],
    observacao: null,
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
