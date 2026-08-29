import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { DIAS_ALERTA, DIAS_CRITICO, formatarData } from '../../core/config';
import { PaleteVencimento } from '../../core/models';

@Component({
  selector: 'app-vencimento',
  imports: [],
  templateUrl: './vencimento.html',
  styleUrl: './vencimento.scss',
})
export class Vencimento implements OnInit {
  private api = inject(ApiService);

  protected readonly opcoesDias = [7, 15, 30, 60, 90];

  protected dias = signal(30);
  protected paletes = signal<PaleteVencimento[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');

  protected readonly criticos = computed(
    () => this.paletes().filter((p) => p.diasRestantes < DIAS_CRITICO).length,
  );

  protected readonly alertas = computed(
    () =>
      this.paletes().filter(
        (p) => p.diasRestantes >= DIAS_CRITICO && p.diasRestantes < DIAS_ALERTA,
      ).length,
  );

  protected readonly tranquilos = computed(
    () => this.paletes().filter((p) => p.diasRestantes >= DIAS_ALERTA).length,
  );

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.api.relatorioVencimento(this.dias()).subscribe({
      next: (lista) => {
        this.paletes.set([...lista].sort((a, b) => a.diasRestantes - b.diasRestantes));
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Falha ao carregar o relatório de vencimento.');
      },
    });
  }

  protected trocarDias(valor: number): void {
    this.dias.set(valor);
    this.carregar();
  }

  /** Semaforo: vermelho < 7 dias, amarelo < 30, verde acima */
  protected semaforo(diasRestantes: number): string {
    if (diasRestantes < DIAS_CRITICO) return 'critico';
    if (diasRestantes < DIAS_ALERTA) return 'alerta';
    return 'ok';
  }

  protected rotuloSemaforo(diasRestantes: number): string {
    if (diasRestantes < DIAS_CRITICO) return 'Crítico';
    if (diasRestantes < DIAS_ALERTA) return 'Atenção';
    return 'Normal';
  }

  protected data(iso: string): string {
    return formatarData(iso);
  }
}
