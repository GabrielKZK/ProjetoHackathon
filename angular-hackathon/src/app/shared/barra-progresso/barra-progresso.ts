import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-barra-progresso',
  imports: [DecimalPipe],
  templateUrl: './barra-progresso.html',
  styleUrl: './barra-progresso.scss',
})
export class BarraProgresso {
  /** 0 a 100 */
  readonly percentual = input.required<number>();
  readonly rotulo = input<string>('');
  readonly detalhe = input<string>('');
  readonly altura = input<number>(14);

  protected readonly largura = computed(() => {
    const p = this.percentual() ?? 0;
    return Math.min(100, Math.max(0, p));
  });

  /** Verde ate 60%, amarelo ate 85%, vermelho acima */
  protected readonly cor = computed(() => {
    const p = this.largura();
    if (p >= 85) return 'var(--vermelho)';
    if (p >= 60) return 'var(--amarelo)';
    return 'var(--verde)';
  });
}
