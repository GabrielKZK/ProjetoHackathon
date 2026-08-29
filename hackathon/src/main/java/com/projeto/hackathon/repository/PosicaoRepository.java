package com.projeto.hackathon.repository;

import com.projeto.hackathon.entity.Posicao;
import com.projeto.hackathon.entity.StatusPosicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PosicaoRepository extends JpaRepository<Posicao, Long> {
    List<Posicao> findByStatus(StatusPosicao status);
    List<Posicao> findByRuaAndStatus(int rua, StatusPosicao status);
    Optional<Posicao> findByCodigo(String codigo);
}
