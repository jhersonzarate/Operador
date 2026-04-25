package com.complytools.repository;

import com.complytools.model.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CaseRepository extends JpaRepository<Case, Long> {

    List<Case> findByEstado(String estado);

    // Casos completados hoy para el dashboard
    @Query("SELECT COUNT(c) FROM Case c WHERE c.estado = 'COMPLETADO' AND c.updatedAt >= :inicio")
    long countCompletadosDesde(@Param("inicio") LocalDateTime inicio);

    // Busqueda por nombre o pais
    @Query("SELECT c FROM Case c WHERE " +
           "LOWER(c.nombreCompleto) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.pais) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Case> buscarPorTexto(@Param("query") String query);
}