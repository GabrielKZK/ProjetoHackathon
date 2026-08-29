export type StatusNota = 'AGUARDANDO_CONFERENCIA' | 'CONFERIDA' | 'DIVERGENTE';
export type StatusPosicao = 'LIVRE' | 'OCUPADA' | 'BLOQUEADA';

export interface Usuario {
  id: number;
  nome: string;
  perfil: string;
  token: string;
}

export interface Credenciais {
  login: string;
  senha: string;
}

export interface Produto {
  id: number;
  sabor: string;
  formato: string;
}

export interface Doca {
  id: number;
  descricao: string;
}

export interface ItemNota {
  produto: { id: number; sabor: string };
  fardosEsperados: number;
  fardosConferidos: number;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  fornecedor: string;
  dataEmissao: string;
  doca: Doca;
  status: StatusNota;
  itens: ItemNota[];
}

export interface NovaNotaFiscal {
  numero: string;
  serie: string;
  fornecedor: string;
  docaId: number;
  itens: { produtoId: number; fardosEsperados: number }[];
}

export interface Posicao {
  id: number;
  rua: number;
  andar: number;
  posicao: number;
  codigo: string;
  status: StatusPosicao;
}

export interface OcupacaoRua {
  rua: number;
  ocupadas: number;
  percentual: number;
}

export interface RelatorioOcupacao {
  totalPosicoes: number;
  ocupadas: number;
  percentual: number;
  litrosArmazenados: number;
  capacidadeLitros: number;
  porRua: OcupacaoRua[];
}

export interface EstoqueSabor {
  sabor: string;
  paletes: number;
  fardos: number;
  garrafas: number;
  litros: number;
  posicoes: string[];
}

export interface PaleteVencimento {
  codigoPalete: string;
  sabor: string;
  posicao: string;
  dataValidade: string;
  diasRestantes: number;
}

export interface ErroApi {
  erro: string;
  mensagem: string;
}
