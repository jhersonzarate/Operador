package com.complytools.controller;

import com.complytools.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * CORRECCIÓN: Se elimina @CrossOrigin — ya está en SecurityConfig.
 */
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/cases/csv")
    public ResponseEntity<byte[]> exportarCasosCSV() {
        String csv = exportService.exportarCasosCSV();
        byte[] bytes = csv.getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "casos-complytools.csv");
        headers.setContentLength(bytes.length);

        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}