/* ============================================================
   GOLLINHO WMS — Web Mobile
   Camada de API. Único ponto que muda na integração:
   USAR_MOCK em config.js (true → false).
   Contrato idêntico ao usado no Angular e no prompt do app RN.
   ============================================================ */

function atraso(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Faz o fetch real e normaliza erro de negócio no formato { status, erro, mensagem }. */
async function chamarApi(caminho, opcoes) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch (falhaRede) {
    throw { status: 0, erro: 'SEM_CONEXAO', mensagem: 'Não foi possível falar com o servidor. Verifique o IP/Wi-Fi.' };
  }

  if (resposta.status === 204) return null;

  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch (_) {
    corpo = null;
  }

  if (!resposta.ok) {
    throw {
      status: resposta.status,
      erro: corpo?.erro ?? 'ERRO',
      mensagem: corpo?.mensagem ?? 'Ocorreu um erro inesperado.',
    };
  }
  return corpo;
}

const Api = {
  async login(login, senha) {
    if (USAR_MOCK) {
      await atraso(250);
      return mockLogin(login, senha);
    }
    return chamarApi('/auth/login', { method: 'POST', body: JSON.stringify({ login, senha }) });
  },

  async listarDocas() {
    if (USAR_MOCK) {
      await atraso(150);
      return mockListarDocas();
    }
    return chamarApi('/docas');
  },

  async listarNotas(docaId, status) {
    if (USAR_MOCK) {
      await atraso(200);
      return mockListarNotas(docaId, status);
    }
    const params = new URLSearchParams();
    if (docaId) params.set('docaId', docaId);
    if (status) params.set('status', status);
    return chamarApi(`/notas-fiscais?${params.toString()}`);
  },

  async buscarNota(id) {
    if (USAR_MOCK) {
      await atraso(150);
      const nota = mockBuscarNota(id);
      if (!nota) throw { status: 404, erro: 'NAO_ENCONTRADA', mensagem: 'Nota fiscal não encontrada.' };
      return nota;
    }
    return chamarApi(`/notas-fiscais/${id}`);
  },

  async conferir(notaId, itens, observacao) {
    if (USAR_MOCK) {
      await atraso(300);
      return mockConferir(notaId, itens, observacao);
    }
    return chamarApi(`/notas-fiscais/${notaId}/conferencia`, {
      method: 'POST',
      body: JSON.stringify({ itens, observacao: observacao || null }),
    });
  },

  async listarPaletes(docaId, status) {
    if (USAR_MOCK) {
      await atraso(200);
      return mockListarPaletes(docaId, status);
    }
    const params = new URLSearchParams();
    if (docaId) params.set('docaId', docaId);
    if (status) params.set('status', status);
    return chamarApi(`/paletes?${params.toString()}`);
  },

  async posicoesLivres(rua) {
    if (USAR_MOCK) {
      await atraso(150);
      return mockPosicoesLivres(rua);
    }
    return chamarApi(`/posicoes/livres?rua=${rua}`);
  },

  async sugestao(paleteId) {
    if (USAR_MOCK) {
      await atraso(200);
      return mockSugestao(paleteId);
    }
    return chamarApi(`/posicoes/sugestao?paleteId=${paleteId}`);
  },

  async armazenar(paleteId, posicaoId) {
    if (USAR_MOCK) {
      await atraso(300);
      return mockArmazenar(paleteId, posicaoId);
    }
    return chamarApi(`/paletes/${paleteId}/armazenar`, {
      method: 'POST',
      body: JSON.stringify({ posicaoId }),
    });
  },
};
