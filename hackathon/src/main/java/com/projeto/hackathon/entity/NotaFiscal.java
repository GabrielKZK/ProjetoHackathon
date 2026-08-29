package com.projeto.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "nota_fiscal")
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    private String serie;

    private String fornecedor;

    private LocalDate dataEmissao;

    @ManyToOne
    @JoinColumn(name = "doca_id")
    private Doca doca;

    @Enumerated(EnumType.STRING)
    private StatusNotaFiscal status;

    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ItemNotaFiscal> itens = new ArrayList<>();

    private String observacao;
}
