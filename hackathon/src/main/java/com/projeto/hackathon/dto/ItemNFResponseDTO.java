package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemNFResponseDTO {
    private Long id;
    private Long produtoId;
    private String sabor;
    private int fardosEsperados;
    private int fardosConferidos;
}
