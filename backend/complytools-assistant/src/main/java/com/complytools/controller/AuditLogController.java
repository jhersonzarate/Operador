package com.complytools.controller;

import com.complytools.model.AuditLog;
import com.complytools.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLog>> listar(
            @RequestParam(defaultValue = "50") int limit) {

        int safeLimit = Math.min(limit, 200);
        List<AuditLog> logs = auditLogRepository.findAllByOrderByFechaDesc(
                PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "fecha"))
        );
        return ResponseEntity.ok(logs);
    }
}