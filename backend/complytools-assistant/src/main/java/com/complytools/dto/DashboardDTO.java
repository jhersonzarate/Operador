package com.complytools.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO de métricas del dashboard.
 *
 * CORRECCIÓN: Se añaden los campos que el prompt exige y que faltaban:
 * - productividadDiaria: casos completados en las últimas 24h
 * - tiempoPromedioPorCaso: minutos promedio desde creación hasta completado
 */
@Data
@Builder
public class DashboardDTO {
    private long totalCasos;
    private long casosCompletados;
    private long casosEnProceso;
    private long casosPendientes;
    private long completadosHoy;
    private long totalFuentes;

    // NUEVOS: requeridos por el prompt
    private long productividadDiaria;          // = completadosHoy (alias semántico para la UI)
    private double tiempoPromedioPorCaso;      // minutos promedio entre creación y último update de casos COMPLETADO
}