package com.projeto.hackathon.controller;

import com.projeto.hackathon.dto.EstoqueItemDTO;
import com.projeto.hackathon.dto.PaleteResponseDTO;
import com.projeto.hackathon.dto.RelatorioOcupacaoDTO;
import com.projeto.hackathon.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;

    @GetMapping("/ocupacao")
    public ResponseEntity<RelatorioOcupacaoDTO> ocupacao() {
        return ResponseEntity.ok(relatorioService.ocupacao());
    }

    @GetMapping("/estoque")
    public ResponseEntity<List<EstoqueItemDTO>> estoque() {
        return ResponseEntity.ok(relatorioService.estoque());
    }

    @GetMapping("/vencimento")
    public ResponseEntity<List<PaleteResponseDTO>> vencimento(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(relatorioService.vencimento(dias));
    }
}
