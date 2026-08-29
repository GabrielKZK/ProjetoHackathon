package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstoqueItemDTO {
    private String sabor;
    private long paletes;
    private long fardos;
    private long garrafas;
    private long litros;
    private List<String> posicoes;
}
