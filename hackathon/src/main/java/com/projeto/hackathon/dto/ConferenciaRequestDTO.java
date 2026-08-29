package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConferenciaRequestDTO {
    private List<ConferenciaItemDTO> itens;
    private String observacao;
}
