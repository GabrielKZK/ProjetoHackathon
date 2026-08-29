import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { ApiService } from '../../core/api.service';
import { FARDOS_POR_PALETE, LITROS_POR_PALETE, paletesDeFardos } from '../../core/config';
import { Doca, NovaNotaFiscal, Produto } from '../../core/models';

interface ItemForm {
  produtoId: number | null;
  fardosEsperados: number | null;
}

@Component({
  selector: 'app-nota-fiscal-nova',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './nota-fiscal-nova.html',
  styleUrl: './nota-fiscal-nova.scss',
})
export class NotaFiscalNova implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private location = inject(Location);

  protected readonly fardosPorPalete = FARDOS_POR_PALETE;
  protected readonly litrosPorPalete = LITROS_POR_PALETE;

  protected produtos = signal<Produto[]>([]);
  protected docas = signal<Doca[]>([]);

  protected numero = '';
  protected serie = '1';
  protected fornecedor = '';
  protected docaId: number | null = null;

  protected itens = signal<ItemForm[]>([{ produtoId: null, fardosEsperados: null }]);

  protected salvando = signal(false);
  protected erro = signal('');
  protected sucesso = signal('');

  /** Totais calculados: 1 palete = 100 fardos = 1.200 L */
  protected readonly totalFardos = computed(() =>
    this.itens().reduce((acc, i) => acc + (Number(i.fardosEsperados) || 0), 0),
  );

  protected readonly totalPaletes = computed(() =>
    this.itens().reduce((acc, i) => acc + paletesDeFardos(Number(i.fardosEsperados) || 0), 0),
  );

  protected readonly totalLitros = computed(() => this.totalFardos() * 6 * 2);

  ngOnInit(): void {
    this.api.listarProdutos().subscribe({
      next: (l) => this.produtos.set(l),
      error: () => this.erro.set('Falha ao carregar os sabores.'),
    });
    this.api.listarDocas().subscribe({
      next: (l) => this.docas.set(l),
      error: () => this.erro.set('Falha ao carregar as docas.'),
    });
  }

  /** Volta para a tela anterior; se nao houver historico, cai na lista de NFs. */
  protected voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/notas-fiscais']);
    }
  }

  protected paletesDoItem(fardos: number | null): number {
    return paletesDeFardos(Number(fardos) || 0);
  }

  protected adicionarItem(): void {
    this.itens.update((lista) => [...lista, { produtoId: null, fardosEsperados: null }]);
  }

  protected removerItem(indice: number): void {
    this.itens.update((lista) => lista.filter((_, i) => i !== indice));
  }

  protected atualizarProduto(indice: number, valor: string): void {
    this.itens.update((lista) =>
      lista.map((item, i) => (i === indice ? { ...item, produtoId: Number(valor) || null } : item)),
    );
  }

  protected atualizarFardos(indice: number, valor: string): void {
    this.itens.update((lista) =>
      lista.map((item, i) =>
        i === indice ? { ...item, fardosEsperados: Number(valor) || null } : item,
      ),
    );
  }

  protected salvar(): void {
    this.erro.set('');
    this.sucesso.set('');

    if (!this.numero.trim() || !this.serie.trim() || !this.fornecedor.trim()) {
      this.erro.set('Preencha número, série e fornecedor.');
      return;
    }
    if (!this.docaId) {
      this.erro.set('Selecione a doca de recebimento.');
      return;
    }

    const validos = this.itens().filter(
      (i) => i.produtoId && i.fardosEsperados && i.fardosEsperados > 0,
    );
    if (!validos.length) {
      this.erro.set('Adicione pelo menos um item com sabor e quantidade de fardos.');
      return;
    }

    const payload: NovaNotaFiscal = {
      numero: this.numero.trim(),
      serie: this.serie.trim(),
      fornecedor: this.fornecedor.trim(),
      docaId: Number(this.docaId),
      itens: validos.map((i) => ({
        produtoId: Number(i.produtoId),
        fardosEsperados: Number(i.fardosEsperados),
      })),
    };

    this.salvando.set(true);

    this.api.criarNota(payload).subscribe({
      next: (nota) => {
        this.salvando.set(false);
        const doca = this.docas().find((d) => d.id === nota.docaId);
        this.sucesso.set(
          `NF ${nota.numero} lançada e direcionada a ${doca?.descricao ?? `doca ${nota.docaId}`}.`,
        );
        setTimeout(() => this.router.navigate(['/notas-fiscais']), 900);
      },
      error: (e) => {
        this.salvando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível lançar a nota fiscal.');
      },
    });
  }
}
