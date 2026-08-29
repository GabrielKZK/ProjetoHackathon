import { Injectable, signal } from '@angular/core';
import { Doca } from './models';

interface ResumoConferencia {
  status: string;
  codigos: string[];
}

/**
 * Estado do fluxo (doca -> nota -> conferência -> palete -> armazenagem).
 * Em memória via signals, mesmo padrão do AuthService — nada de localStorage.
 */
@Injectable({ providedIn: 'root' })
export class OperadorService {
  readonly docaAtual = signal<Doca | null>(null);
  readonly notaAtualId = signal<number | null>(null);
  readonly paleteAtualId = signal<number | null>(null);

  /** Mostrado uma vez na tela de paletes logo depois de confirmar uma conferência. */
  readonly ultimoResumoConferencia = signal<ResumoConferencia | null>(null);

  escolherDoca(doca: Doca): void {
    this.docaAtual.set(doca);
    this.notaAtualId.set(null);
    this.paleteAtualId.set(null);
    this.ultimoResumoConferencia.set(null);
  }

  escolherNota(id: number): void {
    this.notaAtualId.set(id);
  }

  escolherPalete(id: number): void {
    this.paleteAtualId.set(id);
  }

  registrarResumoConferencia(resumo: ResumoConferencia): void {
    this.ultimoResumoConferencia.set(resumo);
  }

  /** Chamado ao entrar na seleção de doca — zera o fluxo anterior. */
  limparFluxo(): void {
    this.docaAtual.set(null);
    this.notaAtualId.set(null);
    this.paleteAtualId.set(null);
    this.ultimoResumoConferencia.set(null);
  }
}
