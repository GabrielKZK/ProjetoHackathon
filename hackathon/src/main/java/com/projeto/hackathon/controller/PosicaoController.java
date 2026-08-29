package com.projeto.hackathon.controller;

import com.projeto.hackathon.dto.PosicaoResponseDTO;
import com.projeto.hackathon.service.PosicaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posicoes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PosicaoController {

    private final PosicaoService posicaoService;

    @GetMapping
    public ResponseEntity<List<PosicaoResponseDTO>> listar() {
        return ResponseEntity.ok(posicaoService.listar());
    }

    @GetMapping("/livres")
    public ResponseEntity<List<PosicaoResponseDTO>> listarLivres(
            @RequestParam(required = false) Integer rua) {
        return ResponseEntity.ok(posicaoService.listarLivres(rua));
    }

    @GetMapping("/sugestao")
    public ResponseEntity<PosicaoResponseDTO> sugerirPosicao(
            @RequestParam Long paleteId) {
        return ResponseEntity.ok(posicaoService.sugerirPosicao(paleteId));
    }
}
