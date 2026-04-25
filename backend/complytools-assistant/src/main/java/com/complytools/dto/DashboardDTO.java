package com.complytools.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardDTO {
    private long totalCasos;
    private long casosCompletados;
    private long casosEnProceso;
    private long casosPendientes;
    private long completadosHoy;
    private long totalFuentes;
}