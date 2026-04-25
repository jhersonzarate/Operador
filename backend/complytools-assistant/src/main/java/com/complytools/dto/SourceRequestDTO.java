package com.complytools.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SourceRequestDTO {

    @NotBlank(message = "La URL es obligatoria")
    @Pattern(
        regexp = "^(https?://).*",
        message = "La URL debe comenzar con http:// o https://"
    )
    private String url;

    @NotBlank(message = "El tipo de fuente es obligatorio")
    private String tipo;

    private String observacion;
    private Boolean sospechosa;
    private Boolean relevante;
}