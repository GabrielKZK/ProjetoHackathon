package com.projeto.hackathon.controller;

import com.projeto.hackathon.dto.*;
import com.projeto.hackathon.service.NotaFiscalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-fiscais")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    @GetMapping
    public ResponseEntity<List<NotaFiscalResponseDTO>> listar(
            @RequestParam(required = false) Long docaId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(notaFiscalService.listar(docaId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscalResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(notaFiscalService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<NotaFiscalResponseDTO> criar(@RequestBody NotaFiscalRequestDTO dto) {
        return ResponseEntity.ok(notaFiscalService.criar(dto));
    }

    @PostMapping("/{id}/conferencia")
    public ResponseEntity<ConferenciaResponseDTO> conferir(
            @PathVariable Long id,
            @RequestBody ConferenciaRequestDTO dto) {
        return ResponseEntity.ok(notaFiscalService.conferir(id, dto));
    }
}
