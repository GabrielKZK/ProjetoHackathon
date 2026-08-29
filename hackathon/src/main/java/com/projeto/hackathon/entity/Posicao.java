package com.projeto.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "posicao")
public class Posicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rua;

    private int andar;

    private int posicao;

    @Column(unique = true)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusPosicao status = StatusPosicao.LIVRE;

    @Version
    private Long version;
}
