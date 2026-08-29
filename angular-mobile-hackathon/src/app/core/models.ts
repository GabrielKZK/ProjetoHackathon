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

export interface Doca {
  id: number;
  descricao: string;
}

export interface ItemNota {
  id: number;
  produtoId: number;
  sabor: string;
  fardosEsperados: number;
  fardosConferidos: number;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  fornecedor: string;
  dataEmissao: string;
  docaId: number;
  status: StatusNota;
  itens: ItemNota[];
  observacao: string | null;
}

export interface Posicao {
  id: number;
  rua: number;
  andar: number;
  posicao: number;
  codigo: string;
  status: StatusPosicao;
  /** sabor guardado ali no momento — usado só pela sugestão de posição */
  sabor?: string | null;
}

export interface ErroApi {
  erro: string;
  mensagem: string;
}

/* ===== Fluxo do operador (conferência cega + armazenagem) ===== */

export interface Palete {
  id: number;
  codigo: string;
  produtoId: number;
  sabor: string;
  fardos: number;
  garrafas: number;
  litros: number;
  parcial: boolean;
  status: 'EM_DOCA' | 'ARMAZENADO';
  docaId: number;
  posicaoId: number | null;
  posicaoCodigo: string | null;
  dataFabricacao: string;
  dataValidade: string;
}

export interface ItemConferido {
  produtoId: number;
  fardosConferidos: number;
}

export interface ResultadoConferencia {
  status: StatusNota;
  paletesGerados: Palete[];
  /** true quando divergiu e ainda não veio observação — o front precisa reenviar */
  precisaObservacao: boolean;
}

export interface ResultadoArmazenagem extends Palete {
  posicao: Posicao;
}
