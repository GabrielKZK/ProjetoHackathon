import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { CAPACIDADE_LITROS, TOTAL_POSICOES } from '../../core/config';
import { EstoqueSabor, Posicao, RelatorioOcupacao } from '../../core/models';
import { BarraProgresso } from '../../shared/barra-progresso/barra-progresso';
import { CardMetrica } from '../../shared/card-metrica/card-metrica';
import { MapaGalpao } from '../../shared/mapa-galpao/mapa-galpao';

/** Sincronizacao com o app mobile: polling de 3 segundos */
const INTERVALO_MS = 3000;

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, BarraProgresso, CardMetrica, MapaGalpao],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly totalPosicoes = TOTAL_POSICOES;
  protected readonly capacidadeLitros = CAPACIDADE_LITROS;

  protected ocupacao = signal<RelatorioOcupacao | null>(null);
  protected posicoes = signal<Posicao[]>([]);
  protected estoque = signal<EstoqueSabor[]>([]);

  protected primeiraCarga = signal(true);
  protected erro = signal('');
  protected atualizadoEm = signal('');

  protected readonly ocupadas = computed(() => this.ocupacao()?.ocupadas ?? 0);
  protected readonly percentual = computed(() => this.ocupacao()?.percentual ?? 0);
  protected readonly livres = computed(() => this.totalPosicoes - this.ocupadas());

  protected readonly litros = computed(() => this.ocupacao()?.litrosArmazenados ?? 0);

  protected readonly percentualVolume = computed(() => {
    const cap = this.ocupacao()?.capacidadeLitros || this.capacidadeLitros;
    return cap ? (this.litros() / cap) * 100 : 0;
  });

  protected readonly garrafas = computed(() => this.litros() / 2);
  protected readonly totalFardos = computed(() => this.ocupadas() * 100);

  protected readonly porRua = computed(() => this.ocupacao()?.porRua ?? []);

  protected readonly bloqueadas = computed(
    () => this.posicoes().filter((p) => p.status === 'BLOQUEADA').length,
  );

  ngOnInit(): void {
    this.atualizar();
    this.timer = setInterval(() => this.atualizar(), INTERVALO_MS);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  protected atualizar(): void {
    this.api.relatorioOcupacao().subscribe({
      next: (dado) => {
        this.ocupacao.set(dado);
        this.erro.set('');
        this.primeiraCarga.set(false);
        this.atualizadoEm.set(new Date().toLocaleTimeString('pt-BR'));
      },
      error: () => {
        this.primeiraCarga.set(false);
        this.erro.set('Sem resposta do backend. Mostrando o último dado recebido.');
      },
    });

    this.api.listarPosicoes().subscribe({
      next: (lista) => this.posicoes.set(lista),
      error: () => {},
    });

    this.api.relatorioEstoque().subscribe({
      next: (lista) => this.estoque.set(lista),
      error: () => {},
    });
  }

  protected corDoSabor(sabor: string): string {
    const mapa: Record<string, string> = {
      guarana: '#14a44d',
      laranja: '#ff7a1a',
      caju: '#f5c518',
      maca: '#d13b3b',
    };
    const chave = sabor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return mapa[chave] ?? '#6b7280';
  }
}
