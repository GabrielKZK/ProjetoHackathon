import { Component, computed, input } from '@angular/core';
import { RUAS } from '../../core/config';
import { Posicao } from '../../core/models';

interface BlocoRua {
  rua: number;
  posicoes: Posicao[];
  ocupadas: number;
  total: number;
}

@Component({
  selector: 'app-mapa-galpao',
  imports: [],
  templateUrl: './mapa-galpao.html',
  styleUrl: './mapa-galpao.scss',
})
export class MapaGalpao {
  readonly posicoes = input.required<Posicao[]>();

  /** Agrupa as 192 posicoes em 6 blocos de 32 (4 andares x 8 posicoes) */
  protected readonly blocos = computed<BlocoRua[]>(() => {
    const todas = this.posicoes() ?? [];

    return Array.from({ length: RUAS }, (_, i) => {
      const rua = i + 1;
      const daRua = todas
        .filter((p) => p.rua === rua)
        .sort((a, b) => a.andar - b.andar || a.posicao - b.posicao);

      return {
        rua,
        posicoes: daRua,
        ocupadas: daRua.filter((p) => p.status === 'OCUPADA').length,
        total: daRua.length,
      };
    });
  });

  protected classeStatus(status: string): string {
    if (status === 'OCUPADA') return 'ocupada';
    if (status === 'BLOQUEADA') return 'bloqueada';
    return 'livre';
  }

  protected tooltip(p: Posicao): string {
    const nomes: Record<string, string> = {
      LIVRE: 'Livre',
      OCUPADA: 'Ocupada',
      BLOQUEADA: 'Bloqueada',
    };
    return `${p.codigo} - ${nomes[p.status] ?? p.status}`;
  }
}
