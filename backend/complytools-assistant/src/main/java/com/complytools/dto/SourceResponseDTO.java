package com.complytools.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SourceResponseDTO {
    private Long id;
    private Long caseId;
    private String url;
    private String tipo;
    private String observacion;
    private Boolean sospechosa;
    private Boolean relevante;
    private LocalDateTime createdAt;
}