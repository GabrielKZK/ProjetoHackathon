package com.projeto.hackathon.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Habilita comunicacao em tempo real (WebSocket + STOMP) entre o backend
 * e os frontends (Angular web e Angular mobile).
 *
 * Endpoint de conexao: ws://<host>:9999/ws  (WebSocket nativo, sem SockJS)
 * Broker de topicos:   /topic/**  -> o backend publica, os clientes assinam
 * Prefixo de app:      /app/**    -> reservado caso o cliente precise mandar mensagem ao servidor
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
