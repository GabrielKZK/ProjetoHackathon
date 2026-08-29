/* ============================================================
   GOLLINHO WMS — Web Mobile
   Dados e comportamento falsos (USAR_MOCK = true em config.js)
   Mesmo formato do contrato de API congelado com a equipe.
   As docas/notas/posições usam os mesmos dados do mock do Angular,
   pra bater com a demo do dashboard web.
   ============================================================ */

const MOCK_PRODUTOS = [
  { id: 1, sabor: 'Guaraná' },
  { id: 2, sabor: 'Laranja' },
  { id: 3, sabor: 'Caju' },
  { id: 4, sabor: 'Maçã' },
];

const MOCK_DOCAS = [
  { id: 1, descricao: 'Doca 1' },
  { id: 2, descricao: 'Doca 2' },
  { id: 3, descricao: 'Doca 3' },
  { id: 4, descricao: 'Doca 4' },
];

/** itens carregam fardosEsperados pro cálculo de divergência,
 *  mas a tela de conferência NUNCA renderiza esse campo (conferência cega). */
let MOCK_NOTAS = [
  {
    id: 1,
    numero: '000123',
    serie: '1',
    fornecedor: 'Distribuidora Sul Ltda',
    dataEmissao: '2026-08-28',
    doca: MOCK_DOCAS[0],
    status: 'CONFERIDA',
    itens: [{ produto: MOCK_PRODUTOS[0], fardosEsperados: 800, fardosConferidos: 800 }],
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
    status: 'AGUARDANDO_CONFERENCIA',
    itens: [{ produto: MOCK_PRODUTOS[3], fardosEsperados: 700, fardosConferidos: 0 }],
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

/** 12 + 9 + 7 + 5 + 3 + 1 = 37 posições ocupadas — mesma semente do Angular,
 *  garante R01-A01-P01 e R01-A01-P02 já ocupadas (RN da especificação, seção 8). */
const OCUPADAS_POR_RUA = [12, 9, 7, 5, 3, 1];

function gerarPosicoesMock() {
  const lista = [];
  let id = 1;
  for (let rua = 1; rua <= RUAS; rua++) {
    let restantes = OCUPADAS_POR_RUA[rua - 1];
    for (let andar = 1; andar <= ANDARES; andar++) {
      for (let posicao = 1; posicao <= POSICOES_POR_ANDAR; posicao++) {
        let status = 'LIVRE';
        if (restantes > 0) {
          status = 'OCUPADA';
          restantes--;
        } else if (rua === 4 && andar === 4 && posicao > 6) {
          status = 'BLOQUEADA';
        }
        lista.push({ id: id++, rua, andar, posicao, codigo: formatarEndereco(rua, andar, posicao), status, sabor: null });
      }
    }
  }
  return lista;
}

let MOCK_POSICOES = gerarPosicoesMock();
let MOCK_PALETES = [];
let seqPalete = 1;

function proximoCodigoPalete() {
  return `PLT-${String(seqPalete++).padStart(6, '0')}`;
}

function mockLogin(login, senha) {
  return {
    id: 2,
    nome: login ? login.charAt(0).toUpperCase() + login.slice(1) : 'Operador',
    perfil: 'OPERADOR',
    token: 'mock-token-gollinho-mobile',
  };
}

function mockListarDocas() {
  return [...MOCK_DOCAS];
}

function mockListarNotas(docaId, status) {
  return MOCK_NOTAS.filter((n) => {
    const bateDoca = !docaId || n.doca.id === Number(docaId);
    const bateStatus = !status || n.status === status;
    return bateDoca && bateStatus;
  });
}

function mockBuscarNota(id) {
  return MOCK_NOTAS.find((n) => n.id === Number(id)) || null;
}

/** Conferência cega: compara o que foi digitado com o fardosEsperados
 *  (que o front nunca mostrou) e gera os paletes automaticamente. */
function mockConferir(notaId, itensConferidos, observacao) {
  const nota = mockBuscarNota(notaId);
  if (!nota) throw { erro: 'NOTA_NAO_ENCONTRADA', mensagem: 'Nota fiscal não encontrada.' };

  let divergiu = false;
  nota.itens.forEach((item) => {
    const conferido = itensConferidos.find((i) => Number(i.produtoId) === item.produto.id);
    item.fardosConferidos = conferido ? Number(conferido.fardosConferidos) : 0;
    if (item.fardosConferidos !== item.fardosEsperados) divergiu = true;
  });

  if (divergiu && !observacao) {
    nota.status = 'DIVERGENTE';
    return { status: 'DIVERGENTE', paletesGerados: [], precisaObservacao: true };
  }

  nota.status = divergiu ? 'DIVERGENTE' : 'CONFERIDA';

  const paletesGerados = [];
  nota.itens.forEach((item) => {
    if (item.fardosConferidos <= 0) return;
    const qtdPaletes = Math.ceil(item.fardosConferidos / FARDOS_POR_PALETE);
    let restante = item.fardosConferidos;
    for (let i = 0; i < qtdPaletes; i++) {
      const fardosPalete = Math.min(FARDOS_POR_PALETE, restante);
      restante -= fardosPalete;
      const palete = {
        id: MOCK_PALETES.length + 1,
        codigo: proximoCodigoPalete(),
        produto: item.produto,
        fardos: fardosPalete,
        garrafas: fardosPalete * GARRAFAS_POR_FARDO,
        litros: fardosPalete * GARRAFAS_POR_FARDO * LITROS_POR_GARRAFA,
        parcial: fardosPalete < FARDOS_POR_PALETE,
        status: 'EM_DOCA',
        docaId: nota.doca.id,
        posicaoId: null,
      };
      MOCK_PALETES.push(palete);
      paletesGerados.push(palete);
    }
  });

  return { status: nota.status, paletesGerados, precisaObservacao: false };
}

function mockListarPaletes(docaId, status) {
  return MOCK_PALETES.filter((p) => {
    const bateDoca = !docaId || p.docaId === Number(docaId);
    const bateStatus = !status || p.status === status;
    return bateDoca && bateStatus;
  });
}

function mockPosicoesLivres(rua) {
  return MOCK_POSICOES.filter((p) => p.status === 'LIVRE' && (!rua || p.rua === Number(rua)));
}

/** Sugestão: prioriza rua que já guarda o mesmo sabor, depois o andar mais baixo. */
function mockSugestao(paleteId) {
  const palete = MOCK_PALETES.find((p) => p.id === Number(paleteId));
  if (!palete) throw { erro: 'PALETE_NAO_ENCONTRADO', mensagem: 'Palete não encontrado.' };

  const ruasComMesmoSabor = new Set(
    MOCK_POSICOES.filter((p) => p.status === 'OCUPADA' && p.sabor === palete.produto.sabor).map((p) => p.rua)
  );

  const livres = MOCK_POSICOES.filter((p) => p.status === 'LIVRE');
  if (livres.length === 0) throw { erro: 'GALPAO_CHEIO', mensagem: 'Não há posições livres no galpão.' };

  livres.sort((a, b) => {
    const aPrioridade = ruasComMesmoSabor.has(a.rua) ? 0 : 1;
    const bPrioridade = ruasComMesmoSabor.has(b.rua) ? 0 : 1;
    if (aPrioridade !== bPrioridade) return aPrioridade - bPrioridade;
    if (a.rua !== b.rua) return a.rua - b.rua;
    if (a.andar !== b.andar) return a.andar - b.andar;
    return a.posicao - b.posicao;
  });

  return livres[0];
}

/** Simula exatamente o 409 do backend quando a posição já está ocupada. */
function mockArmazenar(paleteId, posicaoId) {
  const palete = MOCK_PALETES.find((p) => p.id === Number(paleteId));
  const posicao = MOCK_POSICOES.find((p) => p.id === Number(posicaoId));
  if (!palete) throw { status: 404, erro: 'PALETE_NAO_ENCONTRADO', mensagem: 'Palete não encontrado.' };
  if (!posicao) throw { status: 404, erro: 'POSICAO_NAO_ENCONTRADA', mensagem: 'Posição não encontrada.' };

  if (posicao.status !== 'LIVRE') {
    throw {
      status: 409,
      erro: 'POSICAO_OCUPADA',
      mensagem: `Posição ${posicao.codigo} já ocupada. Escolha outra.`,
    };
  }

  posicao.status = 'OCUPADA';
  posicao.sabor = palete.produto.sabor;
  palete.status = 'ARMAZENADO';
  palete.posicaoId = posicao.id;
  return { ...palete, posicao };
}
