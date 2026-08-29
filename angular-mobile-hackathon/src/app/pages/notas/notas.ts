import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { formatarData } from '../../core/config';
import { NotaFiscal } from '../../core/models';
import { OperadorService } from '../../core/operador.service';
import { BadgeStatus } from '../../shared/badge-status/badge-status';

@Component({
  selector: 'app-notas',
  imports: [BadgeStatus],
  templateUrl: './notas.html',
  styleUrl: './notas.scss',
})
export class Notas implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  protected operador = inject(OperadorService);

  protected readonly formatarData = formatarData;

  protected notas = signal<NotaFiscal[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');

  ngOnInit(): void {
    const doca = this.operador.docaAtual();
    if (!doca) {
      this.router.navigate(['/docas']);
      return;
    }

    this.api.listarNotas({ docaId: doca.id, status: 'AGUARDANDO_CONFERENCIA' }).subscribe({
      next: (lista) => {
        this.notas.set(lista);
        this.carregando.set(false);
      },
      error: (e) => {
        this.carregando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar as notas fiscais.');
      },
    });
  }

  protected abrir(nota: NotaFiscal): void {
    this.operador.escolherNota(nota.id);
    this.router.navigate(['/conferencia']);
  }

  protected irParaPaletes(): void {
    this.router.navigate(['/paletes']);
  }
}
