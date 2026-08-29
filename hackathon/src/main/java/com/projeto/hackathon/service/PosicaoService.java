package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.PosicaoResponseDTO;
import com.projeto.hackathon.entity.*;
import com.projeto.hackathon.exception.BusinessException;
import com.projeto.hackathon.repository.PaleteRepository;
import com.projeto.hackathon.repository.PosicaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosicaoService {

    private final PosicaoRepository posicaoRepository;
    private final PaleteRepository paleteRepository;

    public List<PosicaoResponseDTO> listar() {
        return posicaoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PosicaoResponseDTO> listarLivres(Integer rua) {
        List<Posicao> posicoes;
        if (rua != null) {
            posicoes = posicaoRepository.findByRuaAndStatus(rua, StatusPosicao.LIVRE);
        } else {
            posicoes = posicaoRepository.findByStatus(StatusPosicao.LIVRE);
        }
        return posicoes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PosicaoResponseDTO sugerirPosicao(Long paleteId) {
        Palete palete = paleteRepository.findById(paleteId)
                .orElseThrow(() -> new BusinessException("PALETE_NAO_ENCONTRADO", "Palete não encontrado"));

        String sabor = palete.getProduto() != null ? palete.getProduto().getSabor() : null;
        List<Posicao> livres = posicaoRepository.findByStatus(StatusPosicao.LIVRE);

        if (livres.isEmpty()) {
            throw new BusinessException("SEM_POSICAO_LIVRE", "Não há posições livres no galpão");
        }

        // Encontrar ruas que já têm o mesmo sabor (paletes ARMAZENADOS)
        if (sabor != null) {
            List<Palete> mesmSabor = paleteRepository.findByStatus(StatusPalete.ARMAZENADO).stream()
                    .filter(p -> p.getProduto() != null && sabor.equalsIgnoreCase(p.getProduto().getSabor()))
                    .filter(p -> p.getPosicao() != null)
                    .collect(Collectors.toList());

            if (!mesmSabor.isEmpty()) {
                // Ruas que têm esse sabor
                List<Integer> ruasComSabor = mesmSabor.stream()
                        .map(p -> p.getPosicao().getRua())
                        .distinct()
                        .collect(Collectors.toList());

                // Posições livres nessas ruas, menor andar primeiro
                Posicao sugestao = livres.stream()
                        .filter(p -> ruasComSabor.contains(p.getRua()))
                        .min(Comparator.comparingInt(Posicao::getRua)
                                .thenComparingInt(Posicao::getAndar)
                                .thenComparingInt(Posicao::getPosicao))
                        .orElse(null);

                if (sugestao != null) {
                    return toDTO(sugestao);
                }
            }
        }

        // Fallback: qualquer posição livre (menor rua → menor andar → menor posição)
        Posicao sugestao = livres.stream()
                .min(Comparator.comparingInt(Posicao::getRua)
                        .thenComparingInt(Posicao::getAndar)
                        .thenComparingInt(Posicao::getPosicao))
                .orElseThrow(() -> new BusinessException("SEM_POSICAO_LIVRE", "Não há posições livres no galpão"));

        return toDTO(sugestao);
    }

    private PosicaoResponseDTO toDTO(Posicao p) {
        return PosicaoResponseDTO.builder()
                .id(p.getId())
                .rua(p.getRua())
                .andar(p.getAndar())
                .posicao(p.getPosicao())
                .codigo(p.getCodigo())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .build();
    }
}
