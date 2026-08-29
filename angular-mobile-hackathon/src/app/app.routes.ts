import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Login } from './pages/login/login';
import { Docas } from './pages/docas/docas';
import { Notas } from './pages/notas/notas';
import { Conferencia } from './pages/conferencia/conferencia';
import { Paletes } from './pages/paletes/paletes';
import { Armazenagem } from './pages/armazenagem/armazenagem';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    // App do operador de chão de fábrica — fluxo doca -> nota -> conferência
    // cega -> paletes -> armazenagem. Projeto separado do gerenciador
    // (angular-hackathon), mobile-first.
    path: '',
    component: Shell,
    children: [
      { path: 'docas', component: Docas },
      { path: 'notas', component: Notas },
      { path: 'conferencia', component: Conferencia },
      { path: 'paletes', component: Paletes },
      { path: 'armazenagem', component: Armazenagem },
      { path: '', redirectTo: 'docas', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'docas' },
];
