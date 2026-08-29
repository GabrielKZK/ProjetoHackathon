package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.ProdutoRequestDTO;
import com.projeto.hackathon.dto.ProdutoResponseDTO;
import com.projeto.hackathon.entity.Produto;
import com.projeto.hackathon.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public List<ProdutoResponseDTO> listar() {
        return produtoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProdutoResponseDTO criar(ProdutoRequestDTO dto) {
        Produto produto = Produto.builder()
                .sabor(dto.getSabor())
                .build();
        produto = produtoRepository.save(produto);
        return toDTO(produto);
    }

    private ProdutoResponseDTO toDTO(Produto p) {
        return ProdutoResponseDTO.builder()
                .id(p.getId())
                .sabor(p.getSabor())
                .formato(p.getFormato())
                .garrafasPorFardo(p.getGarrafasPorFardo())
                .litrosPorGarrafa(p.getLitrosPorGarrafa())
                .fardosPorPalete(p.getFardosPorPalete())
                .build();
    }
}
