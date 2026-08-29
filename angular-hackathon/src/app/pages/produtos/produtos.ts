import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { Produto } from '../../core/models';

@Component({
  selector: 'app-produtos',
  imports: [FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos implements OnInit {
  private api = inject(ApiService);

  protected produtos = signal<Produto[]>([]);
  protected novoSabor = '';
  protected salvando = signal(false);
  protected erro = signal('');
  protected sucesso = signal('');

  /** id do sabor com a confirmacao de remocao aberta */
  protected confirmando = signal<number | null>(null);
  protected removendo = signal<number | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.api.listarProdutos().subscribe({
      next: (lista) => this.produtos.set(lista),
      error: () => this.erro.set('Falha ao carregar os produtos.'),
    });
  }

  protected pedirRemocao(id: number): void {
    this.erro.set('');
    this.sucesso.set('');
    this.confirmando.set(id);
  }

  protected cancelarRemocao(): void {
    this.confirmando.set(null);
  }

  protected confirmarRemocao(produto: Produto): void {
    this.erro.set('');
    this.sucesso.set('');
    this.removendo.set(produto.id);

    this.api.removerProduto(produto.id).subscribe({
      next: () => {
        this.removendo.set(null);
        this.confirmando.set(null);
        this.sucesso.set(`Sabor "${produto.sabor}" removido.`);
        this.carregar();
      },
      error: (e) => {
        this.removendo.set(null);
        this.confirmando.set(null);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível remover o sabor.');
      },
    });
  }

  protected cadastrar(): void {
    const sabor = this.novoSabor.trim();
    this.erro.set('');
    this.sucesso.set('');

    if (!sabor) {
      this.erro.set('Digite o nome do sabor.');
      return;
    }

    const jaExiste = this.produtos().some(
      (p) => p.sabor.toLowerCase() === sabor.toLowerCase(),
    );
    if (jaExiste) {
      this.erro.set(`O sabor "${sabor}" já está cadastrado.`);
      return;
    }

    this.salvando.set(true);

    this.api.criarProduto(sabor).subscribe({
      next: () => {
        this.salvando.set(false);
        this.novoSabor = '';
        this.sucesso.set(`Sabor "${sabor}" cadastrado.`);
        this.carregar();
      },
      error: (e) => {
        this.salvando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível cadastrar o sabor.');
      },
    });
  }
}
