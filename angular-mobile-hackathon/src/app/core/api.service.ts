import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { API_URL, USAR_MOCK } from './config';
import {
  Credenciais,
  Doca,
  ItemConferido,
  NotaFiscal,
  Palete,
  Posicao,
  ResultadoArmazenagem,
  ResultadoConferencia,
  Usuario,
} from './models';
import { MOCK_DOCAS, MOCK_NOTAS, MOCK_POSICOES, MOCK_USUARIO } from './mock.data';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private notasMock: NotaFiscal[] = [...MOCK_NOTAS];

  /** Paletes gerados pela conferência. Só existe em memória em modo mock. */
  private paletesMock: Palete[] = [];
  private seqPaleteMock = 1;

  private fake<T>(dado: T): Observable<T> {
    return of(dado).pipe(delay(150));
  }

  private falha(status: number, erro: string, mensagem: string) {
    return throwError(() => ({ status, error: { erro, mensagem } })).pipe(delay(150));
  }

  // ---------------- AUTH ----------------
  login(credenciais: Credenciais): Observable<Usuario> {
    if (USAR_MOCK) {
      return this.fake({ ...MOCK_USUARIO, nome: credenciais.login || MOCK_USUARIO.nome });
    }
    return this.http.post<Usuario>(`${API_URL}/auth/login`, credenciais);
  }

  // ---------------- DOCAS ----------------
  listarDocas(): Observable<Doca[]> {
    if (USAR_MOCK) return this.fake([...MOCK_DOCAS]);
    return this.http.get<Doca[]>(`${API_URL}/docas`);
  }

  // ---------------- NOTAS FISCAIS ----------------
  listarNotas(filtro?: { docaId?: number; status?: string }): Observable<NotaFiscal[]> {
    if (USAR_MOCK) {
      const lista = this.notasMock.filter((n) => {
        const bateDoca = !filtro?.docaId || n.docaId === Number(filtro.docaId);
        const bateStatus = !filtro?.status || n.status === filtro.status;
        return bateDoca && bateStatus;
      });
      return this.fake([...lista]);
    }
    const params: string[] = [];
    if (filtro?.docaId) params.push(`docaId=${filtro.docaId}`);
    if (filtro?.status) params.push(`status=${filtro.status}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<NotaFiscal[]>(`${API_URL}/notas-fiscais${qs}`);
  }

  buscarNota(id: number): Observable<NotaFiscal> {
    if (USAR_MOCK) {
      const nota = this.notasMock.find((n) => n.id === Number(id));
      if (!nota) return this.falha(404, 'NAO_ENCONTRADA', 'Nota fiscal não encontrada.');
      return this.fake({ ...nota, itens: nota.itens.map((i) => ({ ...i })) });
    }
    return this.http.get<NotaFiscal>(`${API_URL}/notas-fiscais/${id}`);
  }

  /**
   * Conferência cega. Compara o que foi digitado com o fardosEsperados
   * (que o front nunca mostra) e, se bateu (ou já veio observação pra
   * confirmar a divergência), gera os paletes automaticamente.
   */
  conferirNota(
    notaId: number,
    itens: ItemConferido[],
    observacao: string | null,
  ): Observable<ResultadoConferencia> {
    if (USAR_MOCK) {
      const nota = this.notasMock.find((n) => n.id === Number(notaId));
      if (!nota) return this.falha(404, 'NAO_ENCONTRADA', 'Nota fiscal não encontrada.');

      let divergiu = false;
      nota.itens.forEach((item) => {
        const conferido = itens.find((i) => Number(i.produtoId) === item.produtoId);
        item.fardosConferidos = conferido ? Number(conferido.fardosConferidos) : 0;
        if (item.fardosConferidos !== item.fardosEsperados) divergiu = true;
      });

      if (divergiu && !observacao) {
        nota.status = 'DIVERGENTE';
        return this.fake<ResultadoConferencia>({ status: 'DIVERGENTE', paletesGerados: [], precisaObservacao: true });
      }

      nota.status = divergiu ? 'DIVERGENTE' : 'CONFERIDA';

      const paletesGerados: Palete[] = [];
      nota.itens.forEach((item) => {
        if (item.fardosConferidos <= 0) return;
        const qtdPaletes = Math.ceil(item.fardosConferidos / 100);
        let restante = item.fardosConferidos;
        for (let i = 0; i < qtdPaletes; i++) {
          const fardosPalete = Math.min(100, restante);
          restante -= fardosPalete;
          const palete: Palete = {
            id: this.seqPaleteMock++,
            codigo: `PLT-${String(this.paletesMock.length + 1).padStart(6, '0')}`,
            produtoId: item.produtoId,
            sabor: item.sabor,
            fardos: fardosPalete,
            garrafas: fardosPalete * 6,
            litros: fardosPalete * 6 * 2,
            parcial: fardosPalete < 100,
            status: 'EM_DOCA',
            docaId: nota.docaId,
            posicaoId: null,
            posicaoCodigo: null,
            dataFabricacao: new Date().toISOString().slice(0, 10),
            dataValidade: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
          };
          this.paletesMock.push(palete);
          paletesGerados.push(palete);
        }
      });

      return this.fake<ResultadoConferencia>({ status: nota.status, paletesGerados, precisaObservacao: false });
    }

    return this.http.post<ResultadoConferencia>(`${API_URL}/notas-fiscais/${notaId}/conferencia`, {
      itens,
      observacao: observacao || null,
    });
  }

  // ---------------- PALETES ----------------
  listarPaletes(filtro?: { docaId?: number; status?: string }): Observable<Palete[]> {
    if (USAR_MOCK) {
      const lista = this.paletesMock.filter((p) => {
        const bateDoca = !filtro?.docaId || p.docaId === Number(filtro.docaId);
        const bateStatus = !filtro?.status || p.status === filtro.status;
        return bateDoca && bateStatus;
      });
      return this.fake([...lista]);
    }
    const params: string[] = [];
    if (filtro?.docaId) params.push(`docaId=${filtro.docaId}`);
    if (filtro?.status) params.push(`status=${filtro.status}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<Palete[]>(`${API_URL}/paletes${qs}`);
  }

  // ---------------- POSICOES ----------------
  posicoesLivres(rua?: number): Observable<Posicao[]> {
    if (USAR_MOCK) {
      const lista = MOCK_POSICOES.filter((p) => p.status === 'LIVRE' && (!rua || p.rua === Number(rua)));
      return this.fake([...lista]);
    }
    const qs = rua ? `?rua=${rua}` : '';
    return this.http.get<Posicao[]>(`${API_URL}/posicoes/livres${qs}`);
  }

  /** Sugestão: prioriza rua que já guarda o mesmo sabor, depois o andar mais baixo. */
  sugestaoPosicao(paleteId: number): Observable<Posicao> {
    if (USAR_MOCK) {
      const palete = this.paletesMock.find((p) => p.id === Number(paleteId));
      if (!palete) return this.falha(404, 'PALETE_NAO_ENCONTRADO', 'Palete não encontrado.');

      const ruasComMesmoSabor = new Set(
        MOCK_POSICOES.filter((p) => p.status === 'OCUPADA' && p.sabor === palete.sabor).map((p) => p.rua),
      );

      const livres = MOCK_POSICOES.filter((p) => p.status === 'LIVRE');
      if (livres.length === 0) return this.falha(409, 'GALPAO_CHEIO', 'Não há posições livres no galpão.');

      const ordenadas = [...livres].sort((a, b) => {
        const prioA = ruasComMesmoSabor.has(a.rua) ? 0 : 1;
        const prioB = ruasComMesmoSabor.has(b.rua) ? 0 : 1;
        if (prioA !== prioB) return prioA - prioB;
        if (a.rua !== b.rua) return a.rua - b.rua;
        if (a.andar !== b.andar) return a.andar - b.andar;
        return a.posicao - b.posicao;
      });

      return this.fake(ordenadas[0]);
    }
    return this.http.get<Posicao>(`${API_URL}/posicoes/sugestao?paleteId=${paleteId}`);
  }

  /** Armazenagem. RN03: só entra se a posição estiver LIVRE — o backend real devolve 409. */
  armazenarPalete(paleteId: number, posicaoId: number): Observable<ResultadoArmazenagem> {
    if (USAR_MOCK) {
      const palete = this.paletesMock.find((p) => p.id === Number(paleteId));
      const posicao = MOCK_POSICOES.find((p) => p.id === Number(posicaoId));
      if (!palete) return this.falha(404, 'PALETE_NAO_ENCONTRADO', 'Palete não encontrado.');
      if (!posicao) return this.falha(404, 'POSICAO_NAO_ENCONTRADA', 'Posição não encontrada.');

      if (posicao.status !== 'LIVRE') {
        return this.falha(409, 'POSICAO_OCUPADA', `Posição ${posicao.codigo} já ocupada. Escolha outra.`);
      }

      posicao.status = 'OCUPADA';
      posicao.sabor = palete.sabor;
      palete.status = 'ARMAZENADO';
      palete.posicaoId = posicao.id;

      return this.fake<ResultadoArmazenagem>({ ...palete, posicao });
    }
    return this.http.post<ResultadoArmazenagem>(`${API_URL}/paletes/${paleteId}/armazenar`, { posicaoId });
  }
}
