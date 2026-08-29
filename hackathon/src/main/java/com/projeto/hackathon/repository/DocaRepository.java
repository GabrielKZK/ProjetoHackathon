package com.projeto.hackathon.repository;

import com.projeto.hackathon.entity.Doca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocaRepository extends JpaRepository<Doca, Long> {
}
