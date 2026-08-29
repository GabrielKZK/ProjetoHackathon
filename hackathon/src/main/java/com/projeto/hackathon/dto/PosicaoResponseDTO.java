package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosicaoResponseDTO {
    private Long id;
    private int rua;
    private int andar;
    private int posicao;
    private String codigo;
    private String status;
}
