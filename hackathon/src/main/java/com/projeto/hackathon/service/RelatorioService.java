package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.*;
import com.projeto.hackathon.entity.*;
import com.projeto.hackathon.repository.PaleteRepository;
import com.projeto.hackathon.repository.PosicaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final PosicaoRepository posicaoRepository;
    private final PaleteRepository paleteRepository;

    public RelatorioOcupacaoDTO ocupacao() {
        List<Posicao> todas = posicaoRepository.findAll();
        long ocupadas = todas.stream()
                .filter(p -> p.getStatus() == StatusPosicao.OCUPADA)
                .count();

        double percentual = todas.isEmpty() ? 0.0 : (double) ocupadas / todas.size() * 100.0;

        // Litros armazenados (paletes ARMAZENADOS)
        List<Palete> armazenados = paleteRepository.findByStatus(StatusPalete.ARMAZENADO);
        long litrosArmazenados = armazenados.stream().mapToLong(Palete::getLitros).sum();

        // Capacidade máxima: 192 posições × 100 fardos × 6 garrafas × 2 litros
        long capacidadeLitros = 192L * 100 * 6 * 2;

        // Por rua (6 ruas, cada uma com 32 posições)
        List<OcupacaoPorRuaDTO> porRua = new ArrayList<>();
        for (int rua = 1; rua <= 6; rua++) {
            final int ruaFinal = rua;
            long ocupadasRua = todas.stream()
                    .filter(p -> p.getRua() == ruaFinal && p.getStatus() == StatusPosicao.OCUPADA)
                    .count();
            double percRua = (double) ocupadasRua / 32.0 * 100.0;
            porRua.add(OcupacaoPorRuaDTO.builder()
                    .rua(rua)
                    .ocupadas(ocupadasRua)
                    .percentual(percRua)
                    .build());
        }

        return RelatorioOcupacaoDTO.builder()
                .totalPosicoes(todas.size())
                .ocupadas(ocupadas)
                .percentual(percentual)
                .litrosArmazenados(litrosArmazenados)
                .capacidadeLitros(capacidadeLitros)
                .porRua(porRua)
                .build();
    }

    public List<EstoqueItemDTO> estoque() {
        List<Palete> armazenados = paleteRepository.findByStatus(StatusPalete.ARMAZENADO);

        Map<String, List<Palete>> porSabor = armazenados.stream()
                .filter(p -> p.getProduto() != null)
                .collect(Collectors.groupingBy(p -> p.getProduto().getSabor()));

        List<EstoqueItemDTO> resultado = new ArrayList<>();
        for (Map.Entry<String, List<Palete>> entry : porSabor.entrySet()) {
            String sabor = entry.getKey();
            List<Palete> paletes = entry.getValue();

            long totalPaletes = paletes.size();
            long totalFardos = paletes.stream().mapToLong(Palete::getFardos).sum();
            long totalGarrafas = paletes.stream().mapToLong(Palete::getGarrafas).sum();
            long totalLitros = paletes.stream().mapToLong(Palete::getLitros).sum();

            List<String> posicoes = paletes.stream()
                    .filter(p -> p.getPosicao() != null)
                    .map(p -> p.getPosicao().getCodigo())
                    .collect(Collectors.toList());

            resultado.add(EstoqueItemDTO.builder()
                    .sabor(sabor)
                    .paletes(totalPaletes)
                    .fardos(totalFardos)
                    .garrafas(totalGarrafas)
                    .litros(totalLitros)
                    .posicoes(posicoes)
                    .build());
        }

        return resultado;
    }

    public List<PaleteResponseDTO> vencimento(int dias) {
        LocalDate limite = LocalDate.now().plusDays(dias);
        return paleteRepository.findAll().stream()
                .filter(p -> p.getDataValidade() != null && !p.getDataValidade().isAfter(limite))
                .sorted(Comparator.comparing(Palete::getDataValidade))
                .map(this::paleteToDTO)
                .collect(Collectors.toList());
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
}
