package com.projeto.hackathon.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Ponto unico para publicar eventos em tempo real para os frontends.
 * Os services chamam estes metodos depois de persistir uma mudanca de estado;
 * o Angular (web e mobile) assina os topicos correspondentes via WebSocketService.
 */
@Component
@RequiredArgsConstructor
public class EventoPublisher {

    private final SimpMessagingTemplate template;

    public void notaFiscalAtualizada(Object notaDTO) {
        template.convertAndSend("/topic/notas-fiscais", WsEvent.of("NOTA_FISCAL_ATUALIZADA", notaDTO));
    }

    public void paleteAtualizado(Object paleteDTO) {
        template.convertAndSend("/topic/paletes", WsEvent.of("PALETE_ATUALIZADO", paleteDTO));
    }

    public void posicaoAtualizada(Object posicaoDTO) {
        template.convertAndSend("/topic/posicoes", WsEvent.of("POSICAO_ATUALIZADA", posicaoDTO));
    }
}
