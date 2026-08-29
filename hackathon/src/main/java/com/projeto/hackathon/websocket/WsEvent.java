package com.projeto.hackathon.websocket;

import lombok.Getter;

import java.time.Instant;

/**
 * Envelope generico enviado via STOMP para os frontends (Angular web e Angular mobile).
 * "tipo" identifica o que aconteceu (ex: "NOTA_FISCAL_ATUALIZADA"), "payload" traz o DTO relacionado.
 */
@Getter
public class WsEvent<T> {

    private final String tipo;
    private final T payload;
    private final long timestamp;

    private WsEvent(String tipo, T payload) {
        this.tipo = tipo;
        this.payload = payload;
        this.timestamp = Instant.now().toEpochMilli();
    }

    public static <T> WsEvent<T> of(String tipo, T payload) {
        return new WsEvent<>(tipo, payload);
    }
}
