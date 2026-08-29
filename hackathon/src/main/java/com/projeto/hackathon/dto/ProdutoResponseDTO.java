package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoResponseDTO {
    private Long id;
    private String sabor;
    private String formato;
    private int garrafasPorFardo;
    private int litrosPorGarrafa;
    private int fardosPorPalete;
}
