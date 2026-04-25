package com.complytools.service;

import com.complytools.dto.SourceRequestDTO;
import com.complytools.dto.SourceResponseDTO;
import com.complytools.model.Case;
import com.complytools.model.Source;
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

    public List<SourceResponseDTO> listarPorCaso(Long caseId) {
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
        if (sourceRepository.existsByCaseEntityIdAndUrl(caseId, dto.getUrl())) {
            throw new IllegalArgumentException("Esta URL ya fue registrada en este caso.");
        }

        Source source = Source.builder()
                .caseEntity(caso)
                .url(dto.getUrl().trim())
                .tipo(dto.getTipo())
                .observacion(dto.getObservacion())
                .sospechosa(dto.getSospechosa() != null ? dto.getSospechosa() : false)
                .relevante(dto.getRelevante() != null ? dto.getRelevante() : true)
                .build();

        Source guardado = sourceRepository.save(source);
        log.info("Fuente registrada en caso {}: {}", caseId, dto.getUrl());
        return mapToResponse(guardado);
    }

    @Transactional
    public SourceResponseDTO actualizarValidacion(Long sourceId, Boolean sospechosa, Boolean relevante) {
        Source source = sourceRepository.findById(sourceId)
                .orElseThrow(() -> new EntityNotFoundException("Fuente no encontrada: " + sourceId));

        source.setSospechosa(sospechosa);
        source.setRelevante(relevante);

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