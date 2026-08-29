package com.projeto.hackathon.controller;

import com.projeto.hackathon.dto.ArmazenarRequestDTO;
import com.projeto.hackathon.dto.PaleteResponseDTO;
import com.projeto.hackathon.service.PaleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paletes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaleteController {

    private final PaleteService paleteService;

    @GetMapping
    public ResponseEntity<List<PaleteResponseDTO>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long docaId,
            @RequestParam(required = false) String sabor) {
        return ResponseEntity.ok(paleteService.listar(status, docaId, sabor));
    }

    @PostMapping("/{id}/armazenar")
    public ResponseEntity<PaleteResponseDTO> armazenar(
            @PathVariable Long id,
            @RequestBody ArmazenarRequestDTO dto) {
        return ResponseEntity.ok(paleteService.armazenar(id, dto.getPosicaoId()));
    }
}
