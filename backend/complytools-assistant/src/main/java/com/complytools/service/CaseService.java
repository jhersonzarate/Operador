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

    @Transactional
    public CaseResponseDTO actualizar(Long id, CaseRequestDTO dto) {
        Case caso = findCaseOrThrow(id);
        String estadoAnterior = caso.getEstado();

        caso.setNombreCompleto(dto.getNombreCompleto().trim());
        caso.setPais(dto.getPais().trim());
        if (dto.getEstado() != null) {
            caso.setEstado(dto.getEstado());
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

    @Transactional(readOnly = true)
    public DashboardDTO obtenerDashboard() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        return DashboardDTO.builder()
                .totalCasos(caseRepository.count())
                .casosCompletados(caseRepository.findByEstado("COMPLETADO").size())
                .casosEnProceso(caseRepository.findByEstado("EN_PROCESO").size())
                .casosPendientes(caseRepository.findByEstado("PENDIENTE").size())
                .completadosHoy(caseRepository.countCompletadosDesde(inicioDia))
                .totalFuentes(sourceRepository.count())
                .build();
    }

    // Mapeo entidad -> DTO de respuesta
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

    /**
     * CORRECCION: el builder de AuditLog no setea 'fecha' manualmente
     * porque @PrePersist lo hace automaticamente. Solo pasamos los campos de negocio.
     */
    private void registrarAuditoria(String accion, String entidad, Long entidadId, String detalle) {
        AuditLog entry = AuditLog.builder()
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .detalle(detalle)
                // user null por ahora (sin autenticacion activa)
                .build();
        auditLogRepository.save(entry);
    }
}