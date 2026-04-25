error id: file:///C:/Users/Jherson%20Silva/complytools-assistant/backend/complytools-assistant/src/main/java/com/complytools/service/ExportService.java:_empty_/Case#getEstado#
file:///C:/Users/Jherson%20Silva/complytools-assistant/backend/complytools-assistant/src/main/java/com/complytools/service/ExportService.java
empty definition using pc, found symbol in pc: _empty_/Case#getEstado#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 1241
uri: file:///C:/Users/Jherson%20Silva/complytools-assistant/backend/complytools-assistant/src/main/java/com/complytools/service/ExportService.java
text:
```scala
package com.complytools.service;

import com.complytools.model.Case;
import com.complytools.repository.CaseRepository;
import com.complytools.repository.SourceRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final CaseRepository caseRepository;
    private final SourceRepository sourceRepository;

    // Genera CSV con todos los casos
    public String exportarCasosCSV() {
        StringWriter writer = new StringWriter();
        try (CSVWriter csv = new CSVWriter(writer)) {
            String[] header = {"ID", "Nombre Completo", "Pais", "Estado", "Total Fuentes", "Fecha Creacion"};
            csv.writeNext(header);

            List<Case> casos = caseRepository.findAll();
            for (Case caso : casos) {
                long fuentes = sourceRepository.countByCaseEntityId(caso.getId());
                String[] row = {
                    String.valueOf(caso.getId()),
                    caso.getNombreCompleto(),
                    caso.getPais(),
                    caso.getEs@@tado(),
                    String.valueOf(fuentes),
                    caso.getCreatedAt().toString()
                };
                csv.writeNext(row);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el CSV: " + e.getMessage());
        }
        return writer.toString();
    }
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: _empty_/Case#getEstado#