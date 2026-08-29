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
public class RelatorioOcupacaoDTO {
    private int totalPosicoes;
    private long ocupadas;
    private double percentual;
    private long litrosArmazenados;
    private long capacidadeLitros;
    private List<OcupacaoPorRuaDTO> porRua;
}
