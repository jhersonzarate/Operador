error id: file:///C:/Users/Jherson%20Silva/complytools-assistant/backend/complytools-assistant/src/main/java/com/complytools/service/SourceService.java:com/complytools/model/AuditLog#
file:///C:/Users/Jherson%20Silva/complytools-assistant/backend/complytools-assistant/src/main/java/com/complytools/service/SourceService.java
empty definition using pc, found symbol in pc: com/complytools/model/AuditLog#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 158
uri: file:///C:/Users/Jherson%20Silva/complytools-assistant/backend/complytools-assistant/src/main/java/com/complytools/service/SourceService.java
text:
```scala
package com.complytools.service;

import com.complytools.dto.SourceRequestDTO;
import com.complytools.dto.SourceResponseDTO;
import com.complytools.model.@@AuditLog;
import com.complytools.model.Case;
import com.complytools.model.Source;
import com.complytools.repository.AuditLogRepository;
import com.complytools.repository.CaseRepository;
import com.complytools.repository.SourceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SourceService {

    private final SourceRepository sourceRepository;
    private final CaseRepository caseRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<SourceResponseDTO> listarPorCaso(Long caseId) {
        if (!caseRepository.existsById(caseId)) {
            throw new EntityNotFoundException("Caso no encontrado: " + caseId);
        }
        return sourceRepository.findByCaseEntityId(caseId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SourceResponseDTO registrar(Long caseId, SourceRequestDTO dto) {
        Case caso = caseRepository.findById(caseId)
                .orElseThrow(() -> new EntityNotFoundException("Caso no encontrado: " + caseId));

        // Validar URL duplicada dentro del mismo caso
        if (sourceRepository.existsByCaseEntityIdAndUrl(caseId, dto.getUrl().trim())) {
            throw new IllegalArgumentException("Esta URL ya fue registrada en este caso.");
        }

        Source source = Source.builder()
                .caseEntity(caso)
                .url(dto.getUrl().trim())
                .tipo(dto.getTipo())
                .observacion(dto.getObservacion())
                .sospechosa(dto.getSospechosa() != null ? dto.getSospechosa() : Boolean.FALSE)
                .relevante(dto.getRelevante() != null ? dto.getRelevante() : Boolean.TRUE)
                .build();

        Source guardado = sourceRepository.save(source);

        // Auditoría de registro de fuente
        AuditLog log = AuditLog.builder()
                .accion("REGISTRAR_FUENTE")
                .entidad("sources")
                .entidadId(guardado.getId())
                .detalle("URL: " + guardado.getUrl() + " — Caso: " + caseId)
                .build();
        auditLogRepository.save(log);

        log.info("Fuente registrada en caso {}: {}", caseId, dto.getUrl());
        return mapToResponse(guardado);
    }

    @Transactional
    public SourceResponseDTO actualizarValidacion(Long sourceId, Boolean sospechosa, Boolean relevante) {
        Source source = sourceRepository.findById(sourceId)
                .orElseThrow(() -> new EntityNotFoundException("Fuente no encontrada: " + sourceId));

        source.setSospechosa(sospechosa != null ? sospechosa : source.getSospechosa());
        source.setRelevante(relevante != null ? relevante : source.getRelevante());

        return mapToResponse(sourceRepository.save(source));
    }

    @Transactional
    public void eliminar(Long sourceId) {
        if (!sourceRepository.existsById(sourceId)) {
            throw new EntityNotFoundException("Fuente no encontrada: " + sourceId);
        }
        sourceRepository.deleteById(sourceId);
    }

    private SourceResponseDTO mapToResponse(Source source) {
        return SourceResponseDTO.builder()
                .id(source.getId())
                .caseId(source.getCaseEntity().getId())
                .url(source.getUrl())
                .tipo(source.getTipo())
                .observacion(source.getObservacion())
                .sospechosa(source.getSospechosa())
                .relevante(source.getRelevante())
                .createdAt(source.getCreatedAt())
                .build();
    }
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: com/complytools/model/AuditLog#