import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { OperadorService } from '../../core/operador.service';

/**
 * Layout enxuto (sem sidebar) — app inteiro é o fluxo do operador de chão
 * de fábrica. Mobile-first: telas grandes, poucos passos, alto contraste.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected operador = inject(OperadorService);

  constructor() {
    if (!this.auth.logado()) {
      this.router.navigate(['/login']);
    }
  }

  protected sair(): void {
    this.operador.limparFluxo();
    this.auth.sair();
    this.router.navigate(['/login']);
  }
}
