import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { formatarData } from '../../core/config';
import { ItemConferido, NotaFiscal } from '../../core/models';
import { OperadorService } from '../../core/operador.service';

interface LinhaConferencia {
  produtoId: number;
  sabor: string;
  fardosConferidos: number | null;
}

@Component({
  selector: 'app-conferencia',
  imports: [FormsModule],
  templateUrl: './conferencia.html',
  styleUrl: './conferencia.scss',
})
export class Conferencia implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  protected operador = inject(OperadorService);

  protected readonly formatarData = formatarData;

  protected nota = signal<NotaFiscal | null>(null);
  protected linhas = signal<LinhaConferencia[]>([]);

  protected carregando = signal(true);
  protected enviando = signal(false);
  protected erro = signal('');
  protected precisaObservacao = signal(false);
  protected observacao = '';

  ngOnInit(): void {
    const doca = this.operador.docaAtual();
    const notaId = this.operador.notaAtualId();

    if (!doca) {
      this.router.navigate(['/docas']);
      return;
    }
    if (!notaId) {
      this.router.navigate(['/notas']);
      return;
    }

    this.api.buscarNota(notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.linhas.set(
          nota.itens.map((item) => ({
            produtoId: item.produto.id,
            sabor: item.produto.sabor,
            fardosConferidos: null,
          })),
        );
        this.carregando.set(false);
      },
      error: (e) => {
        this.carregando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar a nota fiscal.');
      },
    });
  }

  protected atualizarFardos(indice: number, valor: string): void {
    this.linhas.update((lista) =>
      lista.map((l, i) => (i === indice ? { ...l, fardosConferidos: Number(valor) || 0 } : l)),
    );
  }

  protected confirmar(): void {
    const nota = this.nota();
    if (!nota) return;

    if (this.precisaObservacao() && !this.observacao.trim()) {
      this.erro.set('A observação é obrigatória quando a contagem diverge.');
      return;
    }

    this.erro.set('');
    this.enviando.set(true);

    const itens: ItemConferido[] = this.linhas().map((l) => ({
      produtoId: l.produtoId,
      fardosConferidos: Number(l.fardosConferidos) || 0,
    }));

    const observacao = this.precisaObservacao() ? this.observacao.trim() : null;

    this.api.conferirNota(nota.id, itens, observacao).subscribe({
      next: (resultado) => {
        this.enviando.set(false);

        if (resultado.precisaObservacao) {
          this.precisaObservacao.set(true);
          this.erro.set(
            'A contagem não bateu com o esperado. Registre uma observação para confirmar mesmo assim.',
          );
          return;
        }

        this.operador.registrarResumoConferencia({
          status: resultado.status,
          codigos: resultado.paletesGerados.map((p) => p.codigo),
        });
        this.router.navigate(['/paletes']);
      },
      error: (e) => {
        this.enviando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível registrar a conferência.');
      },
    });
  }
}
