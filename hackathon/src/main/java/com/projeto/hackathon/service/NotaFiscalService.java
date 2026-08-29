package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.*;
import com.projeto.hackathon.entity.*;
import com.projeto.hackathon.exception.BusinessException;
import com.projeto.hackathon.repository.*;
import com.projeto.hackathon.websocket.EventoPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;
    private final DocaRepository docaRepository;
    private final ProdutoRepository produtoRepository;
    private final PaleteRepository paleteRepository;
    private final EventoPublisher eventoPublisher;

    public List<NotaFiscalResponseDTO> listar(Long docaId, String status) {
        List<NotaFiscal> notas;

        if (docaId != null && status != null && !status.isBlank()) {
            StatusNotaFiscal statusEnum = StatusNotaFiscal.valueOf(status);
            notas = notaFiscalRepository.findByDocaIdAndStatus(docaId, statusEnum);
        } else if (docaId != null) {
            notas = notaFiscalRepository.findByDocaId(docaId);
        } else if (status != null && !status.isBlank()) {
            StatusNotaFiscal statusEnum = StatusNotaFiscal.valueOf(status);
            notas = notaFiscalRepository.findByStatus(statusEnum);
        } else {
            notas = notaFiscalRepository.findAll();
        }

        return notas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NotaFiscalResponseDTO buscarPorId(Long id) {
        NotaFiscal nota = notaFiscalRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NF_NAO_ENCONTRADA", "Nota fiscal não encontrada"));
        return toDTO(nota);
    }

    @Transactional
    public NotaFiscalResponseDTO criar(NotaFiscalRequestDTO dto) {
        Doca doca = docaRepository.findById(dto.getDocaId())
                .orElseThrow(() -> new BusinessException("DOCA_NAO_ENCONTRADA", "Doca não encontrada"));

        NotaFiscal nota = NotaFiscal.builder()
                .numero(dto.getNumero())
                .serie(dto.getSerie())
                .fornecedor(dto.getFornecedor())
                .dataEmissao(LocalDate.now())
                .doca(doca)
                .status(StatusNotaFiscal.AGUARDANDO_CONFERENCIA)
                .itens(new ArrayList<>())
                .build();

        nota = notaFiscalRepository.save(nota);

        if (dto.getItens() != null) {
            for (ItemNFRequestDTO itemDTO : dto.getItens()) {
                Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                        .orElseThrow(() -> new BusinessException("PRODUTO_NAO_ENCONTRADO", "Produto não encontrado"));

                ItemNotaFiscal item = ItemNotaFiscal.builder()
                        .notaFiscal(nota)
                        .produto(produto)
                        .fardosEsperados(itemDTO.getFardosEsperados())
                        .fardosConferidos(0)
                        .build();
                nota.getItens().add(item);
            }
            nota = notaFiscalRepository.save(nota);
        }

        NotaFiscalResponseDTO notaCriadaDTO = toDTO(nota);
        eventoPublisher.notaFiscalAtualizada(notaCriadaDTO);
        return notaCriadaDTO;
    }

    @Transactional
    public ConferenciaResponseDTO conferir(Long id, ConferenciaRequestDTO dto) {
        NotaFiscal nota = notaFiscalRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NF_NAO_ENCONTRADA", "Nota fiscal não encontrada"));

        if (nota.getStatus() != StatusNotaFiscal.AGUARDANDO_CONFERENCIA) {
            throw new BusinessException("NF_JA_CONFERIDA", "Esta nota fiscal já foi conferida");
        }

        boolean todosConferem = true;
        for (ConferenciaItemDTO conferidoDTO : dto.getItens()) {
            for (ItemNotaFiscal item : nota.getItens()) {
                if (item.getProduto().getId().equals(conferidoDTO.getProdutoId())) {
                    item.setFardosConferidos(conferidoDTO.getFardosConferidos());
                    if (item.getFardosConferidos() != item.getFardosEsperados()) {
                        todosConferem = false;
                    }
                }
            }
        }

        nota.setStatus(todosConferem ? StatusNotaFiscal.CONFERIDA : StatusNotaFiscal.DIVERGENTE);
        nota.setObservacao(dto.getObservacao());
        nota = notaFiscalRepository.save(nota);

        List<Palete> paletesGerados = gerarPaletes(nota);

        List<PaleteResponseDTO> paletesDTO = paletesGerados.stream()
                .map(this::paleteToDTO)
                .collect(Collectors.toList());

        eventoPublisher.notaFiscalAtualizada(toDTO(nota));
        paletesDTO.forEach(eventoPublisher::paleteAtualizado);

        return ConferenciaResponseDTO.builder()
                .status(nota.getStatus().name())
                .paletesGerados(paletesDTO)
                .build();
    }

    private List<Palete> gerarPaletes(NotaFiscal nota) {
        List<Palete> todos = new ArrayList<>();
        LocalDate hoje = LocalDate.now();
        LocalDate validade = hoje.plusDays(180);

        for (ItemNotaFiscal item : nota.getItens()) {
            int fardosConferidos = item.getFardosConferidos();
            if (fardosConferidos <= 0) continue;

            Produto produto = item.getProduto();
            int paleteInteiros = fardosConferidos / 100;
            int resto = fardosConferidos % 100;

            for (int i = 0; i < paleteInteiros; i++) {
                Palete palete = Palete.builder()
                        .produto(produto)
                        .notaFiscal(nota)
                        .fardos(100)
                        .garrafas(100 * produto.getGarrafasPorFardo())
                        .litros(100 * produto.getGarrafasPorFardo() * produto.getLitrosPorGarrafa())
                        .parcial(false)
                        .status(StatusPalete.EM_DOCA)
                        .doca(nota.getDoca())
                        .posicao(null)
                        .dataFabricacao(hoje)
                        .dataValidade(validade)
                        .build();
                palete = paleteRepository.save(palete);
                palete.setCodigo("PLT-" + String.format("%06d", palete.getId()));
                palete = paleteRepository.save(palete);
                todos.add(palete);
            }

            if (resto > 0) {
                Palete palete = Palete.builder()
                        .produto(produto)
                        .notaFiscal(nota)
                        .fardos(resto)
                        .garrafas(resto * produto.getGarrafasPorFardo())
                        .litros(resto * produto.getGarrafasPorFardo() * produto.getLitrosPorGarrafa())
                        .parcial(true)
                        .status(StatusPalete.EM_DOCA)
                        .doca(nota.getDoca())
                        .posicao(null)
                        .dataFabricacao(hoje)
                        .dataValidade(validade)
                        .build();
                palete = paleteRepository.save(palete);
                palete.setCodigo("PLT-" + String.format("%06d", palete.getId()));
                palete = paleteRepository.save(palete);
                todos.add(palete);
            }
        }

        return todos;
    }

    private PaleteResponseDTO paleteToDTO(Palete p) {
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

    private NotaFiscalResponseDTO toDTO(NotaFiscal nota) {
        List<ItemNFResponseDTO> itensDTO = nota.getItens().stream()
                .map(item -> ItemNFResponseDTO.builder()
                        .id(item.getId())
                        .produtoId(item.getProduto() != null ? item.getProduto().getId() : null)
                        .sabor(item.getProduto() != null ? item.getProduto().getSabor() : null)
                        .fardosEsperados(item.getFardosEsperados())
                        .fardosConferidos(item.getFardosConferidos())
                        .build())
                .collect(Collectors.toList());

        return NotaFiscalResponseDTO.builder()
                .id(nota.getId())
                .numero(nota.getNumero())
                .serie(nota.getSerie())
                .fornecedor(nota.getFornecedor())
                .dataEmissao(nota.getDataEmissao())
                .docaId(nota.getDoca() != null ? nota.getDoca().getId() : null)
                .status(nota.getStatus() != null ? nota.getStatus().name() : null)
                .itens(itensDTO)
                .observacao(nota.getObservacao())
                .build();
    }
}
