import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { USAR_MOCK } from '../../core/config';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected readonly usarMock = USAR_MOCK;

  protected login = 'operador';
  protected senha = '123';

  protected carregando = signal(false);
  protected erro = signal('');

  protected entrar(): void {
    if (!this.login || !this.senha) {
      this.erro.set('Informe login e senha.');
      return;
    }

    this.erro.set('');
    this.carregando.set(true);

    this.api.login({ login: this.login, senha: this.senha }).subscribe({
      next: (usuario) => {
        this.auth.definirUsuario(usuario);
        this.carregando.set(false);
        this.router.navigate(['/docas']);
      },
      error: (e) => {
        this.carregando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível entrar. Verifique o backend.');
      },
    });
  }
}
