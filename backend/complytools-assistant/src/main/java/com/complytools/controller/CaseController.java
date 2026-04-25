package com.complytools.controller;

import com.complytools.dto.CaseRequestDTO;
import com.complytools.dto.CaseResponseDTO;
import com.complytools.dto.DashboardDTO;
import com.complytools.service.CaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class CaseController {

    private final CaseService caseService;

    @GetMapping
    public ResponseEntity<List<CaseResponseDTO>> listarTodos() {
        return ResponseEntity.ok(caseService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<CaseResponseDTO> crear(@Valid @RequestBody CaseRequestDTO dto) {
        CaseResponseDTO creado = caseService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CaseRequestDTO dto) {
        return ResponseEntity.ok(caseService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        caseService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<CaseResponseDTO>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(caseService.buscar(q));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> dashboard() {
        return ResponseEntity.ok(caseService.obtenerDashboard());
    }
}