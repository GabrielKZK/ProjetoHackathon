import { Component, computed, input } from '@angular/core';
import { StatusNota } from '../../core/models';

@Component({
  selector: 'app-badge-status',
  imports: [],
  templateUrl: './badge-status.html',
  styleUrl: './badge-status.scss',
})
export class BadgeStatus {
  readonly status = input.required<StatusNota>();

  protected readonly rotulo = computed(() => {
    switch (this.status()) {
      case 'CONFERIDA':
        return 'Conferida';
      case 'DIVERGENTE':
        return 'Divergente';
      default:
        return 'Aguardando';
    }
  });

  protected readonly classe = computed(() => {
    switch (this.status()) {
      case 'CONFERIDA':
        return 'verde';
      case 'DIVERGENTE':
        return 'vermelho';
      default:
        return 'cinza';
    }
  });
}
