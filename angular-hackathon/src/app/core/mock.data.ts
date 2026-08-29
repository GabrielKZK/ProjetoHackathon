import {
  ANDARES,
  CAPACIDADE_LITROS,
  LITROS_POR_PALETE,
  POSICOES_POR_ANDAR,
  POSICOES_POR_RUA,
  RUAS,
  TOTAL_POSICOES,
  formatarEndereco,
} from './config';
import {
  Doca,
  EstoqueSabor,
  NotaFiscal,
  PaleteVencimento,
  Posicao,
  Produto,
  RelatorioOcupacao,
  StatusPosicao,
  Usuario,
} from './models';

export const MOCK_USUARIO: Usuario = {
  id: 1,
  nome: 'Gabriel Nascimento',
  perfil: 'ADMIN',
  token: 'mock-token-gollinho-123',
};

export const MOCK_PRODUTOS: Produto[] = [
  { id: 1, sabor: 'Guaraná', formato: 'PET 2L' },
  { id: 2, sabor: 'Laranja', formato: 'PET 2L' },
  { id: 3, sabor: 'Caju', formato: 'PET 2L' },
  { id: 4, sabor: 'Maçã', formato: 'PET 2L' },
];

export const MOCK_DOCAS: Doca[] = [
  { id: 1, descricao: 'Doca 1' },
  { id: 2, descricao: 'Doca 2' },
  { id: 3, descricao: 'Doca 3' },
  { id: 4, descricao: 'Doca 4' },
];

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
      { id: 1, produtoId: 1, sabor: 'Guaraná', fardosEsperados: 800, fardosConferidos: 800 },
      { id: 2, produtoId: 2, sabor: 'Laranja', fardosEsperados: 400, fardosConferidos: 400 },
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
    itens: [{ id: 3, produtoId: 3, sabor: 'Caju', fardosEsperados: 500, fardosConferidos: 0 }],
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
    itens: [{ id: 4, produtoId: 4, sabor: 'Maçã', fardosEsperados: 700, fardosConferidos: 680 }],
    observacao: 'Divergência de 20 fardos confirmada pelo operador.',
  },
];

/** 12 + 9 + 7 + 5 + 3 + 1 = 37 posicoes ocupadas */
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
        });
      }
    }
  }
  return lista;
}

export const MOCK_POSICOES: Posicao[] = gerarPosicoes();

function arredondar(valor: number): number {
  return Math.round(valor * 10) / 10;
}

export function mockOcupacao(): RelatorioOcupacao {
  const ocupadas = MOCK_POSICOES.filter((p) => p.status === 'OCUPADA').length;

  const porRua = Array.from({ length: RUAS }, (_, i) => {
    const rua = i + 1;
    const qtd = MOCK_POSICOES.filter((p) => p.rua === rua && p.status === 'OCUPADA').length;
    return { rua, ocupadas: qtd, percentual: arredondar((qtd / POSICOES_POR_RUA) * 100) };
  });

  return {
    totalPosicoes: TOTAL_POSICOES,
    ocupadas,
    percentual: arredondar((ocupadas / TOTAL_POSICOES) * 100),
    litrosArmazenados: ocupadas * LITROS_POR_PALETE,
    capacidadeLitros: CAPACIDADE_LITROS,
    porRua,
  };
}

export const MOCK_ESTOQUE: EstoqueSabor[] = [
  {
    sabor: 'Guaraná',
    paletes: 12,
    fardos: 1200,
    garrafas: 7200,
    litros: 14400,
    posicoes: ['R01-A01-P01', 'R01-A01-P02', 'R01-A01-P03'],
  },
  {
    sabor: 'Laranja',
    paletes: 10,
    fardos: 1000,
    garrafas: 6000,
    litros: 12000,
    posicoes: ['R02-A01-P01', 'R02-A01-P02'],
  },
  {
    sabor: 'Caju',
    paletes: 8,
    fardos: 800,
    garrafas: 4800,
    litros: 9600,
    posicoes: ['R03-A01-P01', 'R03-A01-P02'],
  },
  {
    sabor: 'Maçã',
    paletes: 7,
    fardos: 700,
    garrafas: 4200,
    litros: 8400,
    posicoes: ['R04-A01-P01', 'R05-A01-P01'],
  },
];

export const MOCK_VENCIMENTO: PaleteVencimento[] = [
  { codigoPalete: 'PLT-0007', sabor: 'Maçã', posicao: 'R04-A01-P01', dataValidade: '2026-09-02', diasRestantes: 4 },
  { codigoPalete: 'PLT-0011', sabor: 'Caju', posicao: 'R03-A01-P02', dataValidade: '2026-09-04', diasRestantes: 6 },
  { codigoPalete: 'PLT-0019', sabor: 'Laranja', posicao: 'R02-A01-P01', dataValidade: '2026-09-12', diasRestantes: 14 },
  { codigoPalete: 'PLT-0023', sabor: 'Guaraná', posicao: 'R01-A01-P03', dataValidade: '2026-09-20', diasRestantes: 22 },
  { codigoPalete: 'PLT-0031', sabor: 'Guaraná', posicao: 'R01-A02-P01', dataValidade: '2026-10-15', diasRestantes: 47 },
  { codigoPalete: 'PLT-0044', sabor: 'Caju', posicao: 'R03-A02-P04', dataValidade: '2026-11-01', diasRestantes: 64 },
];
