package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.DocaResponseDTO;
import com.projeto.hackathon.entity.Doca;
import com.projeto.hackathon.repository.DocaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocaService {

    private final DocaRepository docaRepository;

    public List<DocaResponseDTO> listar() {
        return docaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DocaResponseDTO toDTO(Doca d) {
        return DocaResponseDTO.builder()
                .id(d.getId())
                .descricao(d.getDescricao())
                .build();
    }
}
