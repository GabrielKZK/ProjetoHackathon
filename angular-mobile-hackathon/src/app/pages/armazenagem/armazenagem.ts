import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { ANDARES, POSICOES_POR_ANDAR, RUAS } from '../../core/config';
import { Palete, Posicao } from '../../core/models';
import { OperadorService } from '../../core/operador.service';

type Etapa = 'rua' | 'andar' | 'posicao' | 'confirmar';

interface AlertaCheio {
  tipo: 'sucesso' | 'erro';
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-armazenagem',
  imports: [],
  templateUrl: './armazenagem.html',
  styleUrl: './armazenagem.scss',
})
export class Armazenagem implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  protected operador = inject(OperadorService);

  protected readonly ruas = Array.from({ length: RUAS }, (_, i) => i + 1);
  protected readonly andares = Array.from({ length: ANDARES }, (_, i) => i + 1);
  protected readonly posicoesPorAndar = Array.from({ length: POSICOES_POR_ANDAR }, (_, i) => i + 1);
  private readonly passoOrdem: Etapa[] = ['rua', 'andar', 'posicao', 'confirmar'];

  protected palete = signal<Palete | null>(null);
  protected carregando = signal(true);
  protected processando = signal(false);
  protected erro = signal('');

  protected etapa = signal<Etapa>('rua');
  protected livresDaRua = signal<Posicao[]>([]);
  protected alertaCheio = signal<AlertaCheio | null>(null);

  protected ruaEscolhida: number | null = null;
  protected andarEscolhido: number | null = null;
  protected posicaoEscolhidaId: number | null = null;
  protected enderecoEscolhido = '';

  ngOnInit(): void {
    const doca = this.operador.docaAtual();
    const paleteId = this.operador.paleteAtualId();

    if (!doca) {
      this.router.navigate(['/docas']);
      return;
    }
    if (!paleteId) {
      this.router.navigate(['/paletes']);
      return;
    }

    this.api.listarPaletes({ docaId: doca.id, status: 'EM_DOCA' }).subscribe({
      next: (lista) => {
        const encontrado = lista.find((p) => p.id === paleteId) ?? null;
        this.palete.set(encontrado);
        this.carregando.set(false);
        if (!encontrado) {
          this.erro.set('Palete não encontrado em doca (talvez já armazenado).');
        }
      },
      error: (e) => {
        this.carregando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar o palete.');
      },
    });
  }

  protected classePasso(nome: Etapa): string {
    if (this.etapa() === nome) return 'ativo';
    return this.passoOrdem.indexOf(nome) < this.passoOrdem.indexOf(this.etapa()) ? 'feito' : '';
  }

  protected escolherRua(rua: number): void {
    this.ruaEscolhida = rua;
    this.andarEscolhido = null;
    this.posicaoEscolhidaId = null;
    this.erro.set('');
    this.processando.set(true);

    this.api.posicoesLivres(rua).subscribe({
      next: (lista) => {
        this.livresDaRua.set(lista);
        this.processando.set(false);
        this.etapa.set('andar');
      },
      error: (e) => {
        this.processando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar as posições.');
      },
    });
  }

  protected livresNoAndar(andar: number): number {
    return this.livresDaRua().filter((p) => p.andar === andar).length;
  }

  protected escolherAndar(andar: number): void {
    if (this.livresNoAndar(andar) === 0) return;
    this.andarEscolhido = andar;
    this.posicaoEscolhidaId = null;
    this.etapa.set('posicao');
  }

  protected posicaoLivre(posicao: number): Posicao | undefined {
    return this.livresDaRua().find((p) => p.andar === this.andarEscolhido && p.posicao === posicao);
  }

  protected escolherPosicao(posicao: number): void {
    const livre = this.posicaoLivre(posicao);
    if (!livre) return;
    this.posicaoEscolhidaId = livre.id;
    this.enderecoEscolhido = livre.codigo;
    this.etapa.set('confirmar');
  }

  protected usarSugestao(): void {
    const palete = this.palete();
    if (!palete) return;
    this.erro.set('');
    this.processando.set(true);

    this.api.sugestaoPosicao(palete.id).subscribe({
      next: (sugestao) => {
        this.processando.set(false);
        this.ruaEscolhida = sugestao.rua;
        this.andarEscolhido = sugestao.andar;
        this.posicaoEscolhidaId = sugestao.id;
        this.enderecoEscolhido = sugestao.codigo;
        this.etapa.set('confirmar');
      },
      error: (e) => {
        this.processando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível sugerir uma posição.');
      },
    });
  }

  protected voltarPara(etapa: Etapa): void {
    this.etapa.set(etapa);
  }

  protected confirmarArmazenagem(): void {
    const palete = this.palete();
    if (!palete || !this.posicaoEscolhidaId) return;

    this.processando.set(true);

    this.api.armazenarPalete(palete.id, this.posicaoEscolhidaId).subscribe({
      next: () => {
        this.processando.set(false);
        this.alertaCheio.set({
          tipo: 'sucesso',
          titulo: 'Palete armazenado!',
          mensagem: `${palete.codigo} guardado em ${this.enderecoEscolhido}.`,
        });
      },
      error: (e) => {
        this.processando.set(false);
        // A validação é no servidor, não na tela — o 409 vira alerta de tela cheia de propósito (RN03).
        this.alertaCheio.set({
          tipo: 'erro',
          titulo: e?.status === 409 ? 'Posição já ocupada!' : 'Não foi possível armazenar',
          mensagem: e?.error?.mensagem ?? 'Escolha uma posição livre.',
        });
      },
    });
  }

  protected fecharAlerta(): void {
    const era = this.alertaCheio();
    this.alertaCheio.set(null);

    if (era?.tipo === 'sucesso') {
      this.router.navigate(['/paletes']);
      return;
    }

    // 409: recarrega as posições livres da rua atual e volta pro passo de posição.
    this.posicaoEscolhidaId = null;
    if (!this.ruaEscolhida) {
      this.etapa.set('rua');
      return;
    }

    this.processando.set(true);
    this.api.posicoesLivres(this.ruaEscolhida).subscribe({
      next: (lista) => {
        this.livresDaRua.set(lista);
        this.processando.set(false);
        this.etapa.set('posicao');
      },
      error: () => {
        this.processando.set(false);
        this.etapa.set('posicao');
      },
    });
  }

  protected codigoPosicao(posicao: number): string {
    return String(posicao).padStart(2, '0');
  }
}
