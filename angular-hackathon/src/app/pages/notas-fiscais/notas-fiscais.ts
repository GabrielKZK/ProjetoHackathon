import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { formatarData, paletesDeFardos } from '../../core/config';
import { NotaFiscal, StatusNota } from '../../core/models';
import { BadgeStatus } from '../../shared/badge-status/badge-status';

@Component({
  selector: 'app-notas-fiscais',
  imports: [FormsModule, RouterLink, BadgeStatus, DecimalPipe],
  templateUrl: './notas-fiscais.html',
  styleUrl: './notas-fiscais.scss',
})
export class NotasFiscais implements OnInit {
  private api = inject(ApiService);

  protected notas = signal<NotaFiscal[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected filtro = signal<'TODAS' | StatusNota>('TODAS');
  protected expandida = signal<number | null>(null);

  protected readonly filtros: Array<{ valor: 'TODAS' | StatusNota; rotulo: string }> = [
    { valor: 'TODAS', rotulo: 'Todas' },
    { valor: 'AGUARDANDO_CONFERENCIA', rotulo: 'Aguardando' },
    { valor: 'CONFERIDA', rotulo: 'Conferidas' },
    { valor: 'DIVERGENTE', rotulo: 'Divergentes' },
  ];

  protected readonly visiveis = computed(() => {
    const f = this.filtro();
    if (f === 'TODAS') return this.notas();
    return this.notas().filter((n) => n.status === f);
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.api.listarNotas().subscribe({
      next: (lista) => {
        this.notas.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Falha ao carregar as notas fiscais.');
      },
    });
  }

  protected contar(status: 'TODAS' | StatusNota): number {
    if (status === 'TODAS') return this.notas().length;
    return this.notas().filter((n) => n.status === status).length;
  }

  protected totalFardos(nota: NotaFiscal): number {
    return nota.itens.reduce((acc, i) => acc + i.fardosEsperados, 0);
  }

  protected totalPaletes(nota: NotaFiscal): number {
    return nota.itens.reduce((acc, i) => acc + paletesDeFardos(i.fardosEsperados), 0);
  }

  protected alternar(id: number): void {
    this.expandida.update((atual) => (atual === id ? null : id));
  }

  protected data(iso: string): string {
    return formatarData(iso);
  }

  protected divergencia(esperados: number, conferidos: number): number {
    return conferidos - esperados;
  }
}
