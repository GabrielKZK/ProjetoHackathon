package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaleteResponseDTO {
    private Long id;
    private String codigo;
    private Long produtoId;
    private String sabor;
    private int fardos;
    private int garrafas;
    private int litros;
    private boolean parcial;
    private String status;
    private Long docaId;
    private Long posicaoId;
    private String posicaoCodigo;
    private LocalDate dataFabricacao;
    private LocalDate dataValidade;
}
