import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { API_URL, USAR_MOCK } from './config';
import {
  Credenciais,
  Doca,
  EstoqueSabor,
  NotaFiscal,
  NovaNotaFiscal,
  PaleteVencimento,
  Posicao,
  Produto,
  RelatorioOcupacao,
  Usuario,
} from './models';
import {
  MOCK_DOCAS,
  MOCK_ESTOQUE,
  MOCK_NOTAS,
  MOCK_POSICOES,
  MOCK_PRODUTOS,
  MOCK_USUARIO,
  MOCK_VENCIMENTO,
  mockOcupacao,
} from './mock.data';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private produtosMock: Produto[] = [...MOCK_PRODUTOS];
  private notasMock: NotaFiscal[] = [...MOCK_NOTAS];

  private fake<T>(dado: T): Observable<T> {
    return of(dado).pipe(delay(150));
  }

  // ---------------- AUTH ----------------
  login(credenciais: Credenciais): Observable<Usuario> {
    if (USAR_MOCK) {
      return this.fake({ ...MOCK_USUARIO, nome: credenciais.login || MOCK_USUARIO.nome });
    }
    return this.http.post<Usuario>(`${API_URL}/auth/login`, credenciais);
  }

  // ---------------- PRODUTOS ----------------
  listarProdutos(): Observable<Produto[]> {
    if (USAR_MOCK) return this.fake([...this.produtosMock]);
    return this.http.get<Produto[]>(`${API_URL}/produtos`);
  }

  criarProduto(sabor: string): Observable<Produto> {
    if (USAR_MOCK) {
      const novo: Produto = {
        id: Math.max(0, ...this.produtosMock.map((p) => p.id)) + 1,
        sabor,
        formato: 'PET 2L',
      };
      this.produtosMock.push(novo);
      return this.fake(novo);
    }
    return this.http.post<Produto>(`${API_URL}/produtos`, { sabor });
  }

  /**
   * Nao esta no contrato congelado com o backend (so tem GET/POST /produtos).
   * Se o time do backend nao subir DELETE /api/produtos/:id, essa chamada
   * falha quando USAR_MOCK vira false. Avisar o responsavel pelo Spring Boot.
   */
  removerProduto(id: number): Observable<void> {
    if (USAR_MOCK) {
      const emUso = this.notasMock.some((n) => n.itens.some((i) => i.produtoId === id));
      if (emUso) {
        return throwError(() => ({
          error: {
            erro: 'PRODUTO_EM_USO',
            mensagem: 'Esse sabor está em pelo menos uma nota fiscal e não pode ser removido.',
          },
        })).pipe(delay(150));
      }
      this.produtosMock = this.produtosMock.filter((p) => p.id !== id);
      return this.fake(undefined as unknown as void);
    }
    return this.http.delete<void>(`${API_URL}/produtos/${id}`);
  }

  // ---------------- DOCAS ----------------
  listarDocas(): Observable<Doca[]> {
    if (USAR_MOCK) return this.fake([...MOCK_DOCAS]);
    return this.http.get<Doca[]>(`${API_URL}/docas`);
  }

  // ---------------- NOTAS FISCAIS ----------------
  listarNotas(): Observable<NotaFiscal[]> {
    if (USAR_MOCK) return this.fake([...this.notasMock]);
    return this.http.get<NotaFiscal[]>(`${API_URL}/notas-fiscais`);
  }

  criarNota(nota: NovaNotaFiscal): Observable<NotaFiscal> {
    if (USAR_MOCK) {
      const numero = nota.numero.trim();
      const serie = nota.serie.trim();

      const duplicada = this.notasMock.some(
        (n) => n.numero.trim() === numero && n.serie.trim() === serie,
      );
      if (duplicada) {
        return throwError(() => ({
          error: {
            erro: 'NF_DUPLICADA',
            mensagem: `Já existe uma nota fiscal ${numero}, série ${serie}, cadastrada.`,
          },
        })).pipe(delay(150));
      }

      const doca = MOCK_DOCAS.find((d) => d.id === Number(nota.docaId)) ?? MOCK_DOCAS[0];
      const criada: NotaFiscal = {
        id: Math.max(0, ...this.notasMock.map((n) => n.id)) + 1,
        numero: nota.numero,
        serie: nota.serie,
        fornecedor: nota.fornecedor,
        dataEmissao: new Date().toISOString().slice(0, 10),
        docaId: doca.id,
        status: 'AGUARDANDO_CONFERENCIA',
        itens: nota.itens.map((i, indice) => ({
          id: indice + 1,
          produtoId: Number(i.produtoId),
          sabor: this.produtosMock.find((p) => p.id === Number(i.produtoId))?.sabor ?? '?',
          fardosEsperados: Number(i.fardosEsperados),
          fardosConferidos: 0,
        })),
        observacao: null,
      };
      this.notasMock.unshift(criada);
      return this.fake(criada);
    }
    return this.http.post<NotaFiscal>(`${API_URL}/notas-fiscais`, nota);
  }

  // ---------------- POSICOES ----------------
  listarPosicoes(): Observable<Posicao[]> {
    if (USAR_MOCK) return this.fake([...MOCK_POSICOES]);
    return this.http.get<Posicao[]>(`${API_URL}/posicoes`);
  }

  // ---------------- RELATORIOS ----------------
  relatorioOcupacao(): Observable<RelatorioOcupacao> {
    if (USAR_MOCK) return this.fake(mockOcupacao());
    return this.http.get<RelatorioOcupacao>(`${API_URL}/relatorios/ocupacao`);
  }

  relatorioEstoque(): Observable<EstoqueSabor[]> {
    if (USAR_MOCK) return this.fake([...MOCK_ESTOQUE]);
    return this.http.get<EstoqueSabor[]>(`${API_URL}/relatorios/estoque`);
  }

  relatorioVencimento(dias = 30): Observable<PaleteVencimento[]> {
    if (USAR_MOCK) {
      return this.fake(MOCK_VENCIMENTO.filter((p) => p.diasRestantes <= dias));
    }
    return this.http.get<PaleteVencimento[]>(`${API_URL}/relatorios/vencimento?dias=${dias}`);
  }
}
