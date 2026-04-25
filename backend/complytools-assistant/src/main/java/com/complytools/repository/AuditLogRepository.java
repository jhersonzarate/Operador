package com.complytools.repository;

import com.complytools.model.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Busca logs de una entidad especifica, ordenados del mas reciente al mas antiguo.
     * Usado para ver el historial de cambios de un caso especifico.
     */
    List<AuditLog> findByEntidadAndEntidadIdOrderByFechaDesc(
            String entidad, Long entidadId, Pageable pageable);

    /**
     * Devuelve todos los logs ordenados por fecha descendente.
     * CORRECCION: el metodo original no tenia el parametro Pageable correctamente
     * enlazado al nombre del metodo. Spring Data lo resuelve por el Pageable pasado.
     */
    List<AuditLog> findAllByOrderByFechaDesc(Pageable pageable);
}