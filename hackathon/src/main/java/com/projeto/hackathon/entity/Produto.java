package com.projeto.hackathon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sabor;

    @Builder.Default
    private String formato = "PET 2L";

    @Builder.Default
    private int garrafasPorFardo = 6;

    @Builder.Default
    private int litrosPorGarrafa = 2;

    @Builder.Default
    private int fardosPorPalete = 100;
}
