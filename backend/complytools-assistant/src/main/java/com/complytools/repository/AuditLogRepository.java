package com.complytools.repository;

import com.complytools.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntidadAndEntidadIdOrderByFechaDesc(String entidad, Long entidadId, Pageable pageable);
    List<AuditLog> findAllByOrderByFechaDesc(Pageable pageable);
}