package com.projeto.hackathon.service;

import com.projeto.hackathon.dto.LoginRequestDTO;
import com.projeto.hackathon.dto.LoginResponseDTO;
import com.projeto.hackathon.entity.Usuario;
import com.projeto.hackathon.exception.BusinessException;
import com.projeto.hackathon.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public LoginResponseDTO login(String login, String senha) {
        Usuario usuario = usuarioRepository.findByLoginAndSenha(login, senha)
                .orElseThrow(() -> new BusinessException("CREDENCIAIS_INVALIDAS", "Login ou senha incorretos"));

        return LoginResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .perfil(usuario.getPerfil() != null ? usuario.getPerfil().name() : null)
                .token("fake-token")
                .build();
    }
}
