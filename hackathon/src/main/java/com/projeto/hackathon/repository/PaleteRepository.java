package com.projeto.hackathon.repository;

import com.projeto.hackathon.entity.Palete;
import com.projeto.hackathon.entity.StatusPalete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaleteRepository extends JpaRepository<Palete, Long> {
    List<Palete> findByStatus(StatusPalete status);
    List<Palete> findByDocaIdAndStatus(Long docaId, StatusPalete status);
    List<Palete> findByProdutoSabor(String sabor);
    List<Palete> findByStatusAndDocaId(StatusPalete status, Long docaId);
}
