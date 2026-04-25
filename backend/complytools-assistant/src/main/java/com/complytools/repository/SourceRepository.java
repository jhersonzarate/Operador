package com.complytools.repository;

import com.complytools.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SourceRepository extends JpaRepository<Source, Long> {
    List<Source> findByCaseEntityId(Long caseId);
    boolean existsByCaseEntityIdAndUrl(Long caseId, String url);
    long countByCaseEntityId(Long caseId);
}