package com.complytools.service;

import com.complytools.dto.CaseRequestDTO;
import com.complytools.dto.CaseResponseDTO;
import com.complytools.dto.DashboardDTO;
import com.complytools.model.AuditLog;
import com.complytools.model.Case;
import com.complytools.repository.AuditLogRepository;
import com.complytools.repository.CaseRepository;
import com.complytools.repository.SourceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaseService {

    private final CaseRepository caseRepository;
    private final SourceRepository sourceRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<CaseResponseDTO> listarTodos() {
        return caseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CaseResponseDTO obtenerPorId(Long id) {
        return mapToResponse(findCaseOrThrow(id));
    }

    @Transactional
    public CaseResponseDTO crear(CaseRequestDTO dto) {
        Case caso = Case.builder()
                .nombreCompleto(dto.getNombreCompleto().trim())
                .pais(dto.getPais().trim())
                .estado(dto.getEstado() != null ? dto.getEstado() : "PENDIENTE")
                .build();

        Case guardado = caseRepository.save(caso);

        registrarAuditoria("CREAR_CASO", "cases", guardado.getId(),
                "Caso creado: " + guardado.getNombreCompleto());

        log.info("Caso creado con ID: {}", guardado.getId());
        return mapToResponse(guardado);
    }

    /**
     * CORRECCIÓN: Validamos que si el nuevo estado es COMPLETADO,
     * el caso debe tener al menos 2 fuentes registradas.
     * Sin este bloqueo, el operador podía cerrar un caso sin evidencia suficiente.
     */
    @Transactional
    public CaseResponseDTO actualizar(Long id, CaseRequestDTO dto) {
        Case caso = findCaseOrThrow(id);
        String estadoAnterior = caso.getEstado();
        String nuevoEstado = dto.getEstado();

        // Bloquear COMPLETADO si no hay suficientes fuentes
        if ("COMPLETADO".equals(nuevoEstado) && !estadoAnterior.equals("COMPLETADO")) {
            long totalFuentes = sourceRepository.countByCaseEntityId(id);
            if (totalFuentes < 2) {
                throw new IllegalStateException(
                    "No se puede completar el caso. Se requieren al menos 2 fuentes registradas. " +
                    "Actualmente tiene " + totalFuentes + "."
                );
            }
        }

        caso.setNombreCompleto(dto.getNombreCompleto().trim());
        caso.setPais(dto.getPais().trim());
        if (nuevoEstado != null) {
            caso.setEstado(nuevoEstado);
        }

        Case guardado = caseRepository.save(caso);

        registrarAuditoria("ACTUALIZAR_CASO", "cases", guardado.getId(),
                "Estado cambiado de " + estadoAnterior + " a " + guardado.getEstado());

        return mapToResponse(guardado);
    }

    @Transactional
    public void eliminar(Long id) {
        Case caso = findCaseOrThrow(id);
        registrarAuditoria("ELIMINAR_CASO", "cases", id,
                "Caso eliminado: " + caso.getNombreCompleto());
        caseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CaseResponseDTO> buscar(String query) {
        return caseRepository.buscarPorTexto(query)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * CORRECCIÓN: Se calculan productividadDiaria y tiempoPromedioPorCaso.
     *
     * tiempoPromedioPorCaso: promedio en minutos entre createdAt y updatedAt
     * de todos los casos en estado COMPLETADO. Si no hay casos completados, retorna 0.
     */
    @Transactional(readOnly = true)
    public DashboardDTO obtenerDashboard() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();

        List<Case> completados = caseRepository.findByEstado("COMPLETADO");

        double tiempoPromedio = completados.stream()
                .filter(c -> c.getCreatedAt() != null && c.getUpdatedAt() != null)
                .mapToLong(c -> Duration.between(c.getCreatedAt(), c.getUpdatedAt()).toMinutes())
                .filter(min -> min >= 0)
                .average()
                .orElse(0.0);

        long completadosHoy = caseRepository.countCompletadosDesde(inicioDia);

        return DashboardDTO.builder()
                .totalCasos(caseRepository.count())
                .casosCompletados(completados.size())
                .casosEnProceso(caseRepository.findByEstado("EN_PROCESO").size())
                .casosPendientes(caseRepository.findByEstado("PENDIENTE").size())
                .completadosHoy(completadosHoy)
                .totalFuentes(sourceRepository.count())
                .productividadDiaria(completadosHoy)
                .tiempoPromedioPorCaso(Math.round(tiempoPromedio * 10.0) / 10.0)
                .build();
    }

    private CaseResponseDTO mapToResponse(Case caso) {
        long totalFuentes = sourceRepository.countByCaseEntityId(caso.getId());
        return CaseResponseDTO.builder()
                .id(caso.getId())
                .nombreCompleto(caso.getNombreCompleto())
                .pais(caso.getPais())
                .estado(caso.getEstado())
                .asignadoA(caso.getUser() != null ? caso.getUser().getNombre() : "Sin asignar")
                .totalFuentes(totalFuentes)
                .createdAt(caso.getCreatedAt())
                .updatedAt(caso.getUpdatedAt())
                .build();
    }

    private Case findCaseOrThrow(Long id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Caso no encontrado con ID: " + id));
    }

    private void registrarAuditoria(String accion, String entidad, Long entidadId, String detalle) {
        AuditLog entry = AuditLog.builder()
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .detalle(detalle)
                .build();
        auditLogRepository.save(entry);
    }
}