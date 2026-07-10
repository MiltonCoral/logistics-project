-- ============================================================
-- Base de datos: logistica_db
-- ============================================================

-- 1. Crear base de datos
CREATE DATABASE logistica_db;

-- Conectar a la base de datos
\c logistica_db;

-- ============================================================
-- Tabla: usuarios
-- Descripción: Gerente y Asistente que acceden al sistema
-- ============================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,        -- Encriptada con BCrypt
    rol VARCHAR(20) NOT NULL               -- 'GERENTE' o 'ASISTENTE'
);

-- ============================================================
-- Tabla: clientes
-- Descripción: Empresas clientes (CPTDC, GRUPO ATLAS, etc.)
-- ============================================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabla: checklists
-- Descripción: Check-list Inspección Vehicular
-- ============================================================
CREATE TABLE checklists (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    placa VARCHAR(20) NOT NULL,
    movimiento VARCHAR(255) NOT NULL,       -- Qué fue a hacer
    ruta_archivo VARCHAR(500) NOT NULL,     -- URL en la nube (R2/S3)
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabla: guias
-- Descripción: Guías de viaje por cliente
-- Relación: Muchas guías pertenecen a un cliente
-- ============================================================
CREATE TABLE guias (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    fecha DATE NOT NULL,
    numero_guia VARCHAR(100) NOT NULL,
    placa VARCHAR(20) NOT NULL,
    motivo_movimiento VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,     -- URL en la nube (R2/S3)
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Clave foránea
    CONSTRAINT fk_guias_cliente 
        FOREIGN KEY (id_cliente) 
        REFERENCES clientes(id) 
        ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_checklists_fecha ON checklists(fecha);
CREATE INDEX idx_checklists_placa ON checklists(placa);
CREATE INDEX idx_guias_id_cliente ON guias(id_cliente);
CREATE INDEX idx_guias_fecha ON guias(fecha);
CREATE INDEX idx_guias_numero_guia ON guias(numero_guia);
CREATE INDEX idx_guias_placa ON guias(placa);

-- ============================================================
-- Datos iniciales
-- ============================================================

-- Usuarios iniciales (contraseña: "logistica2024" encriptada con BCrypt)
-- Nota: El desarrollador debe generar el hash real con BCrypt
INSERT INTO usuarios (nombre, username, password, rol) VALUES
('Gerente General', 'gerente', '$2a$10$hash_aqui_gerente', 'GERENTE'),
('Asistente Logística', 'asistente', '$2a$10$hash_aqui_asistente', 'ASISTENTE');

-- Clientes iniciales
INSERT INTO clientes (nombre_cliente) VALUES
('CPTDC'),
('GRUPO ATLAS'),
('TRANSCOCA'),
('4L');
