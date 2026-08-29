import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

import { WS_URL } from './config';

interface Assinatura {
  topico: string;
  subject: Subject<unknown>;
}

/**
 * Conexao unica (STOMP sobre WebSocket nativo) com o backend Spring.
 * Endpoint: ws://<host>:9999/ws — configurado em WebSocketConfig.java.
 *
 * Uso em qualquer componente/service:
 *   private ws = inject(WebSocketService);
 *   this.ws.listen<PosicaoWsPayload>('/topic/posicoes').subscribe(evento => ...);
 *
 * A reconexao e automatica (reconnectDelay) e as assinaturas sao refeitas
 * sozinhas sempre que a conexao volta, entao os componentes nao precisam
 * se preocupar com quedas de rede durante a demo.
 */
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client;
  private assinaturas: Assinatura[] = [];

  constructor() {
    this.client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = () => {
      this.assinaturas.forEach(({ topico, subject }) => this.assinarNoBroker(topico, subject));
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] erro STOMP:', frame.headers['message'], frame.body);
    };

    this.client.onWebSocketError = () => {
      // Silencioso de proposito: o app funciona via HTTP mesmo sem WS conectado
      // (o backend pode estar desligado durante o desenvolvimento do front).
    };

    this.client.activate();
  }

  /** Assina um topico (ex: '/topic/posicoes') e devolve um Observable com o payload já desserializado. */
  listen<T>(topico: string): Observable<T> {
    const subject = new Subject<T>();
    this.assinaturas.push({ topico, subject: subject as Subject<unknown> });

    if (this.client.connected) {
      this.assinarNoBroker(topico, subject as Subject<unknown>);
    }

    return subject.asObservable();
  }

  get conectado(): boolean {
    return this.client.connected;
  }

  private assinarNoBroker(topico: string, subject: Subject<unknown>): void {
    this.client.subscribe(topico, (mensagem: IMessage) => {
      try {
        subject.next(JSON.parse(mensagem.body));
      } catch {
        subject.next(mensagem.body as unknown);
      }
    });
  }
}
