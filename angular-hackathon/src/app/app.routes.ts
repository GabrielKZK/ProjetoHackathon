import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Produtos } from './pages/produtos/produtos';
import { NotasFiscais } from './pages/notas-fiscais/notas-fiscais';
import { NotaFiscalNova } from './pages/nota-fiscal-nova/nota-fiscal-nova';
import { Vencimento } from './pages/vencimento/vencimento';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'produtos', component: Produtos },
      { path: 'notas-fiscais', component: NotasFiscais },
      { path: 'notas-fiscais/nova', component: NotaFiscalNova },
      { path: 'vencimento', component: Vencimento },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
