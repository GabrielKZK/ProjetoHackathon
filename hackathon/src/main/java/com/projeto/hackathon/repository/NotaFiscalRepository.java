package com.projeto.hackathon.repository;

import com.projeto.hackathon.entity.NotaFiscal;
import com.projeto.hackathon.entity.StatusNotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, Long> {
    List<NotaFiscal> findByDocaIdAndStatus(Long docaId, StatusNotaFiscal status);
    List<NotaFiscal> findByDocaId(Long docaId);
    List<NotaFiscal> findByStatus(StatusNotaFiscal status);
}
