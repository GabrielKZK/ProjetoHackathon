import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Usuario em memoria. Sem localStorage, some no F5 de proposito. */
  readonly usuario = signal<Usuario | null>(null);

  readonly logado = computed(() => this.usuario() !== null);
  readonly nome = computed(() => this.usuario()?.nome ?? '');

  definirUsuario(usuario: Usuario): void {
    this.usuario.set(usuario);
  }

  sair(): void {
    this.usuario.set(null);
  }
}
