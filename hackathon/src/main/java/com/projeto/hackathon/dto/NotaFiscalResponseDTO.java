package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaFiscalResponseDTO {
    private Long id;
    private String numero;
    private String serie;
    private String fornecedor;
    private LocalDate dataEmissao;
    private Long docaId;
    private String status;
    private List<ItemNFResponseDTO> itens;
    private String observacao;
}
