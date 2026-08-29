import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { Palete } from '../../core/models';
import { OperadorService } from '../../core/operador.service';

@Component({
  selector: 'app-paletes',
  imports: [],
  templateUrl: './paletes.html',
  styleUrl: './paletes.scss',
})
export class Paletes implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  protected operador = inject(OperadorService);

  protected readonly resumo = this.operador.ultimoResumoConferencia;

  protected paletes = signal<Palete[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');

  ngOnInit(): void {
    const doca = this.operador.docaAtual();
    if (!doca) {
      this.router.navigate(['/docas']);
      return;
    }

    this.api.listarPaletes({ docaId: doca.id, status: 'EM_DOCA' }).subscribe({
      next: (lista) => {
        this.paletes.set(lista);
        this.carregando.set(false);
      },
      error: (e) => {
        this.carregando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar os paletes.');
      },
    });
  }

  protected fecharResumo(): void {
    this.operador.ultimoResumoConferencia.set(null);
  }

  protected armazenar(palete: Palete): void {
    this.operador.escolherPalete(palete.id);
    this.router.navigate(['/armazenagem']);
  }
}
