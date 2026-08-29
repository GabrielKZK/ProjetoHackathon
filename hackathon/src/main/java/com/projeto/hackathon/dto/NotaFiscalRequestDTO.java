package com.projeto.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaFiscalRequestDTO {
    private String numero;
    private String serie;
    private String fornecedor;
    private Long docaId;
    private List<ItemNFRequestDTO> itens;
}
