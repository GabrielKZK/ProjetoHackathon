package com.projeto.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "palete")
public class Palete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String codigo;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "nota_fiscal_id")
    private NotaFiscal notaFiscal;

    private int fardos;

    private int garrafas;

    private int litros;

    private boolean parcial;

    @Enumerated(EnumType.STRING)
    private StatusPalete status;

    @ManyToOne
    @JoinColumn(name = "doca_id")
    private Doca doca;

    @ManyToOne
    @JoinColumn(name = "posicao_id", nullable = true)
    private Posicao posicao;

    private LocalDate dataFabricacao;

    private LocalDate dataValidade;
}
