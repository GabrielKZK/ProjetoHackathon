import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Usuario em memoria. Sem localStorage, some no F5 de proposito. */
  readonly usuario = signal<Usuario | null>(null);

  readonly logado = computed(() => this.usuario() !== null);
  readonly nome = computed(() => this.usuario()?.nome ?? '');
  readonly perfil = computed(() => this.usuario()?.perfil ?? '');
  readonly isAdmin = computed(() => this.perfil() === 'ADMIN');

  readonly iniciais = computed(() => {
    const partes = this.nome().trim().split(/\s+/);
    if (partes.length === 0 || !partes[0]) return '?';
    const primeira = partes[0][0] ?? '';
    const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? '') : '';
    return (primeira + ultima).toUpperCase();
  });

  definirUsuario(usuario: Usuario): void {
    this.usuario.set(usuario);
  }

  sair(): void {
    this.usuario.set(null);
  }
}
