import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card-metrica',
  imports: [],
  templateUrl: './card-metrica.html',
  styleUrl: './card-metrica.scss',
})
export class CardMetrica {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | null>();
  readonly unidade = input<string | null>('');
  readonly detalhe = input<string | null>('');
  /** 'laranja' | 'verde' | 'vermelho' | 'amarelo' | 'neutro' */
  readonly cor = input<string>('laranja');
  readonly destaque = input<boolean>(false);
}
