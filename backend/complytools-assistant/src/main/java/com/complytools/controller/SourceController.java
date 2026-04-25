package com.complytools.controller;

import com.complytools.dto.SourceRequestDTO;
import com.complytools.dto.SourceResponseDTO;
import com.complytools.service.SourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases/{caseId}/sources")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class SourceController {

    private final SourceService sourceService;

    @GetMapping
    public ResponseEntity<List<SourceResponseDTO>> listar(@PathVariable Long caseId) {
        return ResponseEntity.ok(sourceService.listarPorCaso(caseId));
    }

    @PostMapping
    public ResponseEntity<SourceResponseDTO> registrar(
            @PathVariable Long caseId,
            @Valid @RequestBody SourceRequestDTO dto) {
        SourceResponseDTO creada = sourceService.registrar(caseId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PatchMapping("/{sourceId}/validacion")
    public ResponseEntity<SourceResponseDTO> actualizarValidacion(
            @PathVariable Long caseId,
            @PathVariable Long sourceId,
            @RequestBody Map<String, Boolean> body) {
        Boolean sospechosa = body.getOrDefault("sospechosa", false);
        Boolean relevante = body.getOrDefault("relevante", true);
        return ResponseEntity.ok(sourceService.actualizarValidacion(sourceId, sospechosa, relevante));
    }

    @DeleteMapping("/{sourceId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long caseId,
            @PathVariable Long sourceId) {
        sourceService.eliminar(sourceId);
        return ResponseEntity.noContent().build();
    }
}