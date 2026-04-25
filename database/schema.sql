-- =============================================================
-- COMPLYTOOLS ASSISTANT - Schema PostgreSQL
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios del sistema
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    rol         VARCHAR(50)         NOT NULL DEFAULT 'OPERADOR',
    activo      BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- Tabla principal de casos investigados
CREATE TABLE cases (
    id              BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200)    NOT NULL,
    pais            VARCHAR(100)    NOT NULL,
    estado          VARCHAR(50)     NOT NULL DEFAULT 'PENDIENTE',
    -- PENDIENTE | EN_PROCESO | COMPLETADO
    user_id         BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Tabla de fuentes registradas por caso
CREATE TABLE sources (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT          NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    url             TEXT            NOT NULL,
    tipo            VARCHAR(100)    NOT NULL,
    -- NOTICIAS | JUDICIAL | REGULATORIO | REDES_SOCIALES | OTRO
    observacion     TEXT,
    sospechosa      BOOLEAN         NOT NULL DEFAULT FALSE,
    relevante       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Tabla de auditoría de cambios
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    accion      VARCHAR(255)    NOT NULL,
    entidad     VARCHAR(100)    NOT NULL,
    entidad_id  BIGINT,
    detalle     TEXT,
    fecha       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_cases_estado     ON cases(estado);
CREATE INDEX idx_cases_user_id    ON cases(user_id);
CREATE INDEX idx_sources_case_id  ON sources(case_id);
CREATE INDEX idx_audit_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_fecha      ON audit_logs(fecha);

-- Usuario administrador por defecto (password: admin123 en bcrypt)
INSERT INTO users (nombre, email, password, rol)
VALUES (
    'Administrador',
    'admin@complytools.com',
    '$2a$10$7QnXY1mZkLpVb3nEqW8iZ.eKlT2RvN6mDcHgJ9sA0uBpFxCwYdOte',
    'ADMIN'
);