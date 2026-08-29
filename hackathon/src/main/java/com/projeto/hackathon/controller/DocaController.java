package com.projeto.hackathon.controller;

import com.projeto.hackathon.dto.DocaResponseDTO;
import com.projeto.hackathon.service.DocaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/docas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DocaController {

    private final DocaService docaService;

    @GetMapping
    public ResponseEntity<List<DocaResponseDTO>> listar() {
        return ResponseEntity.ok(docaService.listar());
    }
}
