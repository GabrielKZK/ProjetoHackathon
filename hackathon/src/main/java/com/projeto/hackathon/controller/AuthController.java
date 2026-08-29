package com.projeto.hackathon.controller;

import com.projeto.hackathon.dto.LoginRequestDTO;
import com.projeto.hackathon.dto.LoginResponseDTO;
import com.projeto.hackathon.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto.getLogin(), dto.getSenha()));
    }
}
