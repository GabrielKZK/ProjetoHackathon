import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { Doca } from '../../core/models';
import { OperadorService } from '../../core/operador.service';

@Component({
  selector: 'app-docas',
  imports: [],
  templateUrl: './docas.html',
  styleUrl: './docas.scss',
})
export class Docas implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  protected operador = inject(OperadorService);

  protected docas = signal<Doca[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');

  ngOnInit(): void {
    this.operador.limparFluxo();
    this.api.listarDocas().subscribe({
      next: (lista) => {
        this.docas.set(lista);
        this.carregando.set(false);
      },
      error: (e) => {
        this.carregando.set(false);
        this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar as docas.');
      },
    });
  }

  protected selecionar(doca: Doca): void {
    this.operador.escolherDoca(doca);
    this.router.navigate(['/notas']);
  }
}
