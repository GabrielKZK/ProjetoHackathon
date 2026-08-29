package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.PaleteResponseDTO;
import com.projeto.hackathon.entity.*;
import com.projeto.hackathon.exception.BusinessException;
import com.projeto.hackathon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaleteService {

    private final PaleteRepository paleteRepository;
    private final PosicaoRepository posicaoRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<PaleteResponseDTO> listar(String status, Long docaId, String sabor) {
        List<Palete> paletes;

        if (status != null && !status.isBlank() && docaId != null) {
            StatusPalete statusEnum = StatusPalete.valueOf(status);
            paletes = paleteRepository.findByStatusAndDocaId(statusEnum, docaId);
        } else if (status != null && !status.isBlank()) {
            StatusPalete statusEnum = StatusPalete.valueOf(status);
            paletes = paleteRepository.findByStatus(statusEnum);
        } else if (docaId != null) {
            paletes = paleteRepository.findByDocaIdAndStatus(docaId, null);
            paletes = paleteRepository.findAll().stream()
                    .filter(p -> p.getDoca() != null && p.getDoca().getId().equals(docaId))
                    .collect(Collectors.toList());
        } else if (sabor != null && !sabor.isBlank()) {
            paletes = paleteRepository.findByProdutoSabor(sabor);
        } else {
            paletes = paleteRepository.findAll();
        }

        if (sabor != null && !sabor.isBlank() && (status != null || docaId != null)) {
            String saborFiltro = sabor;
            paletes = paletes.stream()
                    .filter(p -> p.getProduto() != null && saborFiltro.equalsIgnoreCase(p.getProduto().getSabor()))
                    .collect(Collectors.toList());
        }

        return paletes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public PaleteResponseDTO armazenar(Long paleteId, Long posicaoId) {
        Palete palete = paleteRepository.findById(paleteId)
                .orElseThrow(() -> new BusinessException("PALETE_NAO_ENCONTRADO", "Palete não encontrado"));

        if (palete.getStatus() != StatusPalete.EM_DOCA) {
            throw new BusinessException("PALETE_NAO_EM_DOCA", "Palete não está com status EM_DOCA");
        }

        Posicao posicao = posicaoRepository.findById(posicaoId)
                .orElseThrow(() -> new BusinessException("POSICAO_NAO_ENCONTRADA", "Posição não encontrada"));

        if (posicao.getStatus() != StatusPosicao.LIVRE) {
            throw new BusinessException("POSICAO_OCUPADA",
                    "Posição " + posicao.getCodigo() + " já ocupada. Escolha outra.");
        }

        posicao.setStatus(StatusPosicao.OCUPADA);
        posicaoRepository.save(posicao);

        palete.setStatus(StatusPalete.ARMAZENADO);
        palete.setPosicao(posicao);
        palete = paleteRepository.save(palete);

        Movimentacao mov = Movimentacao.builder()
                .palete(palete)
                .posicaoDestino(posicao)
                .usuario(null)
                .dataHora(LocalDateTime.now())
                .build();
        movimentacaoRepository.save(mov);

        return toDTO(palete);
    }

    public PaleteResponseDTO toDTO(Palete p) {
        return PaleteResponseDTO.builder()
                .id(p.getId())
                .codigo(p.getCodigo())
                .produtoId(p.getProduto() != null ? p.getProduto().getId() : null)
                .sabor(p.getProduto() != null ? p.getProduto().getSabor() : null)
                .fardos(p.getFardos())
                .garrafas(p.getGarrafas())
                .litros(p.getLitros())
                .parcial(p.isParcial())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .docaId(p.getDoca() != null ? p.getDoca().getId() : null)
                .posicaoId(p.getPosicao() != null ? p.getPosicao().getId() : null)
                .posicaoCodigo(p.getPosicao() != null ? p.getPosicao().getCodigo() : null)
                .dataFabricacao(p.getDataFabricacao())
                .dataValidade(p.getDataValidade())
                .build();
    }
}
