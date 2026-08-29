import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { USAR_MOCK } from '../../core/config';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: string;
  somenteAdmin: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private router = inject(Router);
  protected auth = inject(AuthService);

  protected readonly usarMock = USAR_MOCK;

  protected readonly menu: ItemMenu[] = [
    { rota: '/dashboard', rotulo: 'Dashboard', icone: '▦', somenteAdmin: false },
    { rota: '/notas-fiscais', rotulo: 'Notas Fiscais', icone: '🧾', somenteAdmin: false },
    { rota: '/notas-fiscais/nova', rotulo: 'Lançar NF', icone: '＋', somenteAdmin: false },
    { rota: '/produtos', rotulo: 'Produtos', icone: '🥤', somenteAdmin: true },
    { rota: '/vencimento', rotulo: 'Vencimento', icone: '⏱', somenteAdmin: false },
  ];

  constructor() {
    if (!this.auth.logado()) {
      this.router.navigate(['/login']);
    }
  }

  protected get itensVisiveis(): ItemMenu[] {
    return this.menu.filter((i) => !i.somenteAdmin || this.auth.isAdmin());
  }

  protected sair(): void {
    this.auth.sair();
    this.router.navigate(['/login']);
  }
}
