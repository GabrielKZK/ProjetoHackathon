package com.projeto.hackathon.config;

import com.projeto.hackathon.dto.ItemNFRequestDTO;
import com.projeto.hackathon.dto.NotaFiscalRequestDTO;
import com.projeto.hackathon.entity.*;
import com.projeto.hackathon.repository.*;
import com.projeto.hackathon.service.NotaFiscalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProdutoRepository produtoRepository;
    private final DocaRepository docaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PosicaoRepository posicaoRepository;
    private final NotaFiscalService notaFiscalService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Iniciando seed do banco de dados...");

        // 1. Produtos
        Produto guarana = produtoRepository.save(Produto.builder().sabor("Guaraná").build());
        Produto laranja = produtoRepository.save(Produto.builder().sabor("Laranja").build());
        Produto caju = produtoRepository.save(Produto.builder().sabor("Caju").build());
        Produto maca = produtoRepository.save(Produto.builder().sabor("Maçã").build());
        log.info("Produtos criados: Guaraná, Laranja, Caju, Maçã");

        // 2. Docas
        docaRepository.save(Doca.builder().descricao("Doca 1").build());
        docaRepository.save(Doca.builder().descricao("Doca 2").build());
        docaRepository.save(Doca.builder().descricao("Doca 3").build());
        docaRepository.save(Doca.builder().descricao("Doca 4").build());
        log.info("Docas criadas: Doca 1, Doca 2, Doca 3, Doca 4");

        // 3. Usuários
        Admin admin = new Admin();
        admin.setNome("Administrador");
        admin.setLogin("admin");
        admin.setSenha("123");
        usuarioRepository.save(admin);

        Operador operador = new Operador();
        operador.setNome("Operador");
        operador.setLogin("operador");
        operador.setSenha("123");
        usuarioRepository.save(operador);
        log.info("Usuários criados: admin/123, operador/123");

        // 4. 192 posições (6 ruas × 4 andares × 8 posições)
        for (int rua = 1; rua <= 6; rua++) {
            for (int andar = 1; andar <= 4; andar++) {
                for (int pos = 1; pos <= 8; pos++) {
                    String codigo = String.format("R%02d-A%02d-P%02d", rua, andar, pos);
                    Posicao posicao = Posicao.builder()
                            .rua(rua)
                            .andar(andar)
                            .posicao(pos)
                            .codigo(codigo)
                            .status(StatusPosicao.LIVRE)
                            .build();
                    posicaoRepository.save(posicao);
                }
            }
        }
        log.info("192 posições criadas");

        // 5. Marcar R01-A01-P01 e R01-A01-P02 como OCUPADAS (demo de bloqueio)
        posicaoRepository.findByCodigo("R01-A01-P01").ifPresent(p -> {
            p.setStatus(StatusPosicao.OCUPADA);
            posicaoRepository.save(p);
        });
        posicaoRepository.findByCodigo("R01-A01-P02").ifPresent(p -> {
            p.setStatus(StatusPosicao.OCUPADA);
            posicaoRepository.save(p);
        });
        log.info("Posições R01-A01-P01 e R01-A01-P02 marcadas como OCUPADAS para demo");

        // 6. Notas fiscais aguardando conferência (ponto de partida do fluxo do operador)
        notaFiscalService.criar(new NotaFiscalRequestDTO("000101", "1", "Distribuidora Sul", 1L,
                List.of(new ItemNFRequestDTO(guarana.getId(), 250),
                        new ItemNFRequestDTO(laranja.getId(), 150))));
        notaFiscalService.criar(new NotaFiscalRequestDTO("000102", "1", "Bebidas Norte", 2L,
                List.of(new ItemNFRequestDTO(caju.getId(), 300))));
        notaFiscalService.criar(new NotaFiscalRequestDTO("000103", "2", "Atacado Leste", 3L,
                List.of(new ItemNFRequestDTO(maca.getId(), 200),
                        new ItemNFRequestDTO(guarana.getId(), 100))));
        log.info("Notas fiscais criadas: 000101 (Doca 1), 000102 (Doca 2), 000103 (Doca 3)");

        log.info("Seed concluído com sucesso!");
    }
}
