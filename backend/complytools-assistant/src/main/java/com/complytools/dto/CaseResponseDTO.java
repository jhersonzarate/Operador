package com.complytools.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CaseResponseDTO {
    private Long id;
    private String nombreCompleto;
    private String pais;
    private String estado;
    private String asignadoA;
    private long totalFuentes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}