# 📋 Documentación Técnica - Backend Sistema de Gestión Documental Logística
# CON AUTENTICACIÓN JWT

## 1. Estructura de Carpetas del Proyecto

```
logistica-api/
├── pom.xml
├── database.sql
├── test-api.sh
└── src/
    └── main/
        ├── resources/
        │   └── application.properties
        └── java/
            └── com/logistica/
                ├── LogisticaApiApplication.java
                ├── config/
                │   ├── SecurityConfig.java
                │   └── JwtConfig.java
                ├── controller/
                │   ├── AuthController.java
                │   ├── ChecklistController.java
                │   ├── ClienteController.java
                │   └── GuiaController.java
                ├── dao/
                │   ├── UsuarioDao.java
                │   ├── ChecklistDao.java
                │   ├── ClienteDao.java
                │   └── GuiaDao.java
                ├── model/
                │   ├── Usuario.java
                │   ├── Checklist.java
                │   ├── Cliente.java
                │   └── Guia.java
                ├── security/
                │   ├── JwtUtil.java
                │   └── JwtAuthenticationFilter.java
                └── service/
                    └── AuthService.java
```

---

## 2. SQL - Creación de Base de Datos y Tablas

Archivo: `database.sql`

```sql
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
```

---

## 3. Modelos (POJOs)

### 3.1 Usuario.java
```java
package com.logistica.model;

public class Usuario {
    private Long id;
    private String nombre;
    private String username;
    private String password;
    private String rol; // GERENTE o ASISTENTE

    public Usuario() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
```

### 3.2 Cliente.java
```java
package com.logistica.model;

import java.time.LocalDateTime;

public class Cliente {
    private Long id;
    private String nombreCliente;
    private LocalDateTime fechaCreacion;

    public Cliente() {}
    public Cliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
```

### 3.3 Checklist.java
```java
package com.logistica.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Checklist {
    private Long id;
    private LocalDate fecha;
    private String placa;
    private String movimiento;
    private String rutaArchivo;      // URL en la nube
    private String nombreArchivo;
    private LocalDateTime fechaSubida;

    public Checklist() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMovimiento() { return movimiento; }
    public void setMovimiento(String movimiento) { this.movimiento = movimiento; }

    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }
}
```

### 3.4 Guia.java
```java
package com.logistica.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Guia {
    private Long id;
    private Long idCliente;            // Relación con tabla clientes
    private LocalDate fecha;
    private String numeroGuia;
    private String placa;
    private String motivoMovimiento;
    private String rutaArchivo;        // URL en la nube
    private String nombreArchivo;
    private LocalDateTime fechaSubida;

    // Campo extra para mostrar nombre del cliente en consultas
    private String nombreCliente;

    public Guia() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMotivoMovimiento() { return motivoMovimiento; }
    public void setMotivoMovimiento(String motivoMovimiento) { this.motivoMovimiento = motivoMovimiento; }

    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
}
```

---

## 4. DAOs (Acceso a Datos con JdbcTemplate)

### 4.1 UsuarioDao.java
```java
package com.logistica.dao;

import com.logistica.model.Usuario;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UsuarioDao {

    private final JdbcTemplate jdbcTemplate;

    public UsuarioDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Usuario> rowMapper = (rs, rowNum) -> {
        Usuario u = new Usuario();
        u.setId(rs.getLong("id"));
        u.setNombre(rs.getString("nombre"));
        u.setUsername(rs.getString("username"));
        u.setPassword(rs.getString("password"));
        u.setRol(rs.getString("rol"));
        return u;
    };

    // Buscar usuario por username (para login)
    public Usuario findByUsername(String username) {
        String sql = "SELECT id, nombre, username, password, rol FROM usuarios WHERE username = ?";
        List<Usuario> result = jdbcTemplate.query(sql, rowMapper, username);
        return result.isEmpty() ? null : result.get(0);
    }

    // Listar todos los usuarios
    public List<Usuario> findAll() {
        String sql = "SELECT id, nombre, username, password, rol FROM usuarios";
        return jdbcTemplate.query(sql, rowMapper);
    }
}
```

### 4.2 ClienteDao.java
```java
package com.logistica.dao;

import com.logistica.model.Cliente;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class ClienteDao {

    private final JdbcTemplate jdbcTemplate;

    public ClienteDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Cliente> rowMapper = (rs, rowNum) -> {
        Cliente c = new Cliente();
        c.setId(rs.getLong("id"));
        c.setNombreCliente(rs.getString("nombre_cliente"));
        c.setFechaCreacion(rs.getTimestamp("fecha_creacion").toLocalDateTime());
        return c;
    };

    // Listar todos los clientes
    public List<Cliente> findAll() {
        String sql = "SELECT id, nombre_cliente, fecha_creacion FROM clientes ORDER BY nombre_cliente";
        return jdbcTemplate.query(sql, rowMapper);
    }

    // Buscar cliente por ID
    public Cliente findById(Long id) {
        String sql = "SELECT id, nombre_cliente, fecha_creacion FROM clientes WHERE id = ?";
        List<Cliente> result = jdbcTemplate.query(sql, rowMapper, id);
        return result.isEmpty() ? null : result.get(0);
    }

    // Crear nuevo cliente
    public Cliente save(Cliente cliente) {
        String sql = "INSERT INTO clientes (nombre_cliente) VALUES (?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, cliente.getNombreCliente());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            cliente.setId(key.longValue());
        }
        return cliente;
    }

    // Eliminar cliente
    public void deleteById(Long id) {
        String sql = "DELETE FROM clientes WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
```

### 4.3 ChecklistDao.java
```java
package com.logistica.dao;

import com.logistica.model.Checklist;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Date;
import java.util.List;

@Repository
public class ChecklistDao {

    private final JdbcTemplate jdbcTemplate;

    public ChecklistDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Checklist> rowMapper = (rs, rowNum) -> {
        Checklist c = new Checklist();
        c.setId(rs.getLong("id"));
        c.setFecha(rs.getDate("fecha").toLocalDate());
        c.setPlaca(rs.getString("placa"));
        c.setMovimiento(rs.getString("movimiento"));
        c.setRutaArchivo(rs.getString("ruta_archivo"));
        c.setNombreArchivo(rs.getString("nombre_archivo"));
        c.setFechaSubida(rs.getTimestamp("fecha_subida").toLocalDateTime());
        return c;
    };

    // Listar todos (ordenados por fecha descendente)
    public List<Checklist> findAll() {
        String sql = "SELECT id, fecha, placa, movimiento, ruta_archivo, nombre_archivo, fecha_subida " +
                     "FROM checklists ORDER BY fecha DESC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    // Buscar por ID
    public Checklist findById(Long id) {
        String sql = "SELECT id, fecha, placa, movimiento, ruta_archivo, nombre_archivo, fecha_subida " +
                     "FROM checklists WHERE id = ?";
        List<Checklist> result = jdbcTemplate.query(sql, rowMapper, id);
        return result.isEmpty() ? null : result.get(0);
    }

    // Filtrar por fecha y/o placa
    public List<Checklist> findByFiltro(String fecha, String placa) {
        StringBuilder sql = new StringBuilder(
            "SELECT id, fecha, placa, movimiento, ruta_archivo, nombre_archivo, fecha_subida " +
            "FROM checklists WHERE 1=1"
        );

        if (fecha != null && !fecha.isEmpty()) {
            sql.append(" AND fecha = ?");
        }
        if (placa != null && !placa.isEmpty()) {
            sql.append(" AND placa ILIKE ?");
        }
        sql.append(" ORDER BY fecha DESC");

        java.util.List<Object> params = new java.util.ArrayList<>();
        if (fecha != null && !fecha.isEmpty()) {
            params.add(Date.valueOf(fecha));
        }
        if (placa != null && !placa.isEmpty()) {
            params.add("%" + placa + "%");
        }

        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    // Filtrar por rango de fechas (para exportar/imprimir)
    public List<Checklist> findByRangoFechas(String fechaInicio, String fechaFin) {
        String sql = "SELECT id, fecha, placa, movimiento, ruta_archivo, nombre_archivo, fecha_subida " +
                     "FROM checklists WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC";
        return jdbcTemplate.query(sql, rowMapper, Date.valueOf(fechaInicio), Date.valueOf(fechaFin));
    }

    // Crear nuevo checklist
    public Checklist save(Checklist checklist) {
        String sql = "INSERT INTO checklists (fecha, placa, movimiento, ruta_archivo, nombre_archivo) " +
                     "VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setDate(1, Date.valueOf(checklist.getFecha()));
            ps.setString(2, checklist.getPlaca());
            ps.setString(3, checklist.getMovimiento());
            ps.setString(4, checklist.getRutaArchivo());
            ps.setString(5, checklist.getNombreArchivo());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            checklist.setId(key.longValue());
        }
        return checklist;
    }

    // Eliminar checklist
    public void deleteById(Long id) {
        String sql = "DELETE FROM checklists WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
```

### 4.4 GuiaDao.java
```java
package com.logistica.dao;

import com.logistica.model.Guia;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Date;
import java.util.List;

@Repository
public class GuiaDao {

    private final JdbcTemplate jdbcTemplate;

    public GuiaDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Guia> rowMapper = (rs, rowNum) -> {
        Guia g = new Guia();
        g.setId(rs.getLong("id"));
        g.setIdCliente(rs.getLong("id_cliente"));
        g.setFecha(rs.getDate("fecha").toLocalDate());
        g.setNumeroGuia(rs.getString("numero_guia"));
        g.setPlaca(rs.getString("placa"));
        g.setMotivoMovimiento(rs.getString("motivo_movimiento"));
        g.setRutaArchivo(rs.getString("ruta_archivo"));
        g.setNombreArchivo(rs.getString("nombre_archivo"));
        g.setFechaSubida(rs.getTimestamp("fecha_subida").toLocalDateTime());
        g.setNombreCliente(rs.getString("nombre_cliente"));
        return g;
    };

    // Listar todas las guías con nombre de cliente
    public List<Guia> findAll() {
        String sql = "SELECT g.*, c.nombre_cliente FROM guias g " +
                     "INNER JOIN clientes c ON g.id_cliente = c.id " +
                     "ORDER BY g.fecha DESC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    // Listar guías de un cliente específico
    public List<Guia> findByClienteId(Long idCliente) {
        String sql = "SELECT g.*, c.nombre_cliente FROM guias g " +
                     "INNER JOIN clientes c ON g.id_cliente = c.id " +
                     "WHERE g.id_cliente = ? ORDER BY g.fecha DESC";
        return jdbcTemplate.query(sql, rowMapper, idCliente);
    }

    // Buscar guía por ID
    public Guia findById(Long id) {
        String sql = "SELECT g.*, c.nombre_cliente FROM guias g " +
                     "INNER JOIN clientes c ON g.id_cliente = c.id WHERE g.id = ?";
        List<Guia> result = jdbcTemplate.query(sql, rowMapper, id);
        return result.isEmpty() ? null : result.get(0);
    }

    // Filtrar guías por cliente + fecha + guía + placa
    public List<Guia> findByFiltro(Long idCliente, String fecha, String numeroGuia, String placa) {
        StringBuilder sql = new StringBuilder(
            "SELECT g.*, c.nombre_cliente FROM guias g " +
            "INNER JOIN clientes c ON g.id_cliente = c.id WHERE g.id_cliente = ?"
        );

        java.util.List<Object> params = new java.util.ArrayList<>();
        params.add(idCliente);

        if (fecha != null && !fecha.isEmpty()) {
            sql.append(" AND g.fecha = ?");
            params.add(Date.valueOf(fecha));
        }
        if (numeroGuia != null && !numeroGuia.isEmpty()) {
            sql.append(" AND g.numero_guia ILIKE ?");
            params.add("%" + numeroGuia + "%");
        }
        if (placa != null && !placa.isEmpty()) {
            sql.append(" AND g.placa ILIKE ?");
            params.add("%" + placa + "%");
        }
        sql.append(" ORDER BY g.fecha DESC");

        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    // Filtrar por rango de fechas para un cliente (exportar/imprimir)
    public List<Guia> findByRangoFechas(Long idCliente, String fechaInicio, String fechaFin) {
        String sql = "SELECT g.*, c.nombre_cliente FROM guias g " +
                     "INNER JOIN clientes c ON g.id_cliente = c.id " +
                     "WHERE g.id_cliente = ? AND g.fecha BETWEEN ? AND ? ORDER BY g.fecha ASC";
        return jdbcTemplate.query(sql, rowMapper, idCliente, Date.valueOf(fechaInicio), Date.valueOf(fechaFin));
    }

    // Crear nueva guía
    public Guia save(Guia guia) {
        String sql = "INSERT INTO guias (id_cliente, fecha, numero_guia, placa, motivo_movimiento, ruta_archivo, nombre_archivo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, guia.getIdCliente());
            ps.setDate(2, Date.valueOf(guia.getFecha()));
            ps.setString(3, guia.getNumeroGuia());
            ps.setString(4, guia.getPlaca());
            ps.setString(5, guia.getMotivoMovimiento());
            ps.setString(6, guia.getRutaArchivo());
            ps.setString(7, guia.getNombreArchivo());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            guia.setId(key.longValue());
        }
        return guia;
    }

    // Eliminar guía
    public void deleteById(Long id) {
        String sql = "DELETE FROM guias WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
```

---

## 5. SEGURIDAD JWT - NUEVA SECCIÓN

### 5.1 pom.xml (Actualizado con JWT)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0</version>
        <relativePath/>
    </parent>

    <groupId>com.logistica</groupId>
    <artifactId>logistica-api</artifactId>
    <version>1.0.0</version>
    <name>Logistica API</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- JDBC -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>

        <!-- PostgreSQL -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Seguridad Spring -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- ============================================ -->
        <!-- JWT - JSON Web Token (jjwt) -->
        <!-- ============================================ -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 5.2 JwtConfig.java - Configuración del Token

```java
package com.logistica.config;

import org.springframework.context.annotation.Configuration;

/**
 * Configuración de JWT
 * SECRET: Clave secreta para firmar los tokens (mínimo 256 bits)
 * EXPIRATION: Tiempo de expiración del token (24 horas = 86400000 ms)
 */
@Configuration
public class JwtConfig {

    // CAMBIAR ESTA CLAVE EN PRODUCCIÓN - Debe ser larga y segura
    public static final String SECRET = "logistica_secret_key_2024_super_segura_para_firmar_tokens_jwt_no_compartir";

    // Token válido por 24 horas
    public static final long EXPIRATION = 86400000;

    // Prefijo del token en el header HTTP
    public static final String TOKEN_PREFIX = "Bearer ";

    // Nombre del header donde va el token
    public static final String HEADER = "Authorization";
}
```

### 5.3 JwtUtil.java - Generar y Validar Tokens

```java
package com.logistica.security;

import com.logistica.config.JwtConfig;
import com.logistica.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // Crear la clave secreta a partir del string
    private final SecretKey secretKey = Keys.hmacShaKeyFor(
        JwtConfig.SECRET.getBytes(StandardCharsets.UTF_8)
    );

    /**
     * Generar token JWT para un usuario
     * El token incluye: id, username, nombre, rol
     */
    public String generateToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", usuario.getId());
        claims.put("nombre", usuario.getNombre());
        claims.put("rol", usuario.getRol());

        return Jwts.builder()
                .claims(claims)
                .subject(usuario.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + JwtConfig.EXPIRATION))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Extraer el username del token
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extraer el rol del token
     */
    public String extractRol(String token) {
        return extractAllClaims(token).get("rol", String.class);
    }

    /**
     * Extraer el nombre del token
     */
    public String extractNombre(String token) {
        return extractAllClaims(token).get("nombre", String.class);
    }

    /**
     * Verificar si el token está expirado
     */
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Validar si el token es válido
     */
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extraer todos los claims del token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

### 5.4 JwtAuthenticationFilter.java - Filtro de Seguridad

```java
package com.logistica.security;

import com.logistica.config.JwtConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro que se ejecuta en CADA petición HTTP.
 * Verifica si hay un token JWT válido en el header Authorization.
 * Si el token es válido, permite el acceso. Si no, bloquea la petición.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Obtener el header Authorization
        String authHeader = request.getHeader(JwtConfig.HEADER);

        // 2. Si no hay header o no empieza con "Bearer ", continuar sin autenticar
        if (authHeader == null || !authHeader.startsWith(JwtConfig.TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer el token (quitar "Bearer ")
        String token = authHeader.substring(JwtConfig.TOKEN_PREFIX.length());

        // 4. Validar el token
        if (jwtUtil.validateToken(token)) {
            String username = jwtUtil.extractUsername(token);
            String rol = jwtUtil.extractRol(token);

            // 5. Crear objeto de autenticación de Spring Security
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    Collections.singletonList(() -> "ROLE_" + rol)
                );

            // 6. Guardar la autenticación en el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 7. Continuar con la petición
        filterChain.doFilter(request, response);
    }
}
```

### 5.5 SecurityConfig.java - Configuración de Seguridad Spring

```java
package com.logistica.config;

import com.logistica.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Desactivar CSRF (no se usa con JWT)
            .csrf(csrf -> csrf.disable())

            // Configurar CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Sin sesiones (stateless - cada petición lleva su token)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Reglas de autorización
            .authorizeHttpRequests(auth -> auth
                // Login es público (no requiere token)
                .requestMatchers("/api/auth/login").permitAll()

                // Todo lo demás requiere autenticación con JWT
                .anyRequest().authenticated()
            )

            // Agregar el filtro JWT ANTES del filtro de autenticación de Spring
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuración CORS - Permite que el frontend se conecte desde otro puerto
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*")); // En producción: especificar dominio exacto
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

## 6. Service - Lógica de Negocio

### 6.1 AuthService.java

```java
package com.logistica.service;

import com.logistica.dao.UsuarioDao;
import com.logistica.model.Usuario;
import com.logistica.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UsuarioDao usuarioDao;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UsuarioDao usuarioDao, JwtUtil jwtUtil, BCryptPasswordEncoder passwordEncoder) {
        this.usuarioDao = usuarioDao;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Autenticar usuario y generar token JWT
     */
    public Map<String, Object> login(String username, String password) {
        Map<String, Object> response = new HashMap<>();

        Usuario usuario = usuarioDao.findByUsername(username);

        if (usuario == null) {
            response.put("success", false);
            response.put("message", "Usuario no encontrado");
            return response;
        }

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            response.put("success", false);
            response.put("message", "Contraseña incorrecta");
            return response;
        }

        // Generar token JWT
        String token = jwtUtil.generateToken(usuario);

        response.put("success", true);
        response.put("token", token);
        response.put("nombre", usuario.getNombre());
        response.put("rol", usuario.getRol());

        return response;
    }
}
```

---

## 7. Controllers (Endpoints REST con JWT)

### 7.1 AuthController.java - Login del Sistema

```java
package com.logistica.controller;

import com.logistica.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Login de usuario (Gerente o Asistente)
     * Body: { "username": "gerente", "password": "logistica2024" }
     * Response exitoso: { "success": true, "token": "eyJhbGci...", "nombre": "Gerente General", "rol": "GERENTE" }
     * Response error: { "success": false, "message": "Contraseña incorrecta" }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Map<String, Object> result = authService.login(username, password);

        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(401).body(result);
        }
    }
}
```

### 7.2 ClienteController.java - Gestión de Clientes

```java
package com.logistica.controller;

import com.logistica.dao.ClienteDao;
import com.logistica.model.Cliente;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteDao clienteDao;

    public ClienteController(ClienteDao clienteDao) {
        this.clienteDao = clienteDao;
    }

    /**
     * GET /api/clientes
     * Listar todos los clientes (CPTDC, GRUPO ATLAS, etc.)
     * Requiere: Header Authorization con Bearer <token>
     * Response: [{ "id": 1, "nombreCliente": "CPTDC", "fechaCreacion": "2024-01-15T10:00:00" }]
     */
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteDao.findAll();
    }

    /**
     * GET /api/clientes/{id}
     * Obtener un cliente por su ID
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerCliente(@PathVariable Long id) {
        Cliente cliente = clienteDao.findById(id);
        if (cliente != null) {
            return ResponseEntity.ok(cliente);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * POST /api/clientes
     * Crear un nuevo cliente (añadir empresa nueva)
     * Requiere: Header Authorization con Bearer <token>
     * Body: { "nombreCliente": "NUEVO CLIENTE S.A." }
     * Response: { "id": 5, "nombreCliente": "NUEVO CLIENTE S.A.", ... }
     */
    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        Cliente nuevo = clienteDao.save(cliente);
        return ResponseEntity.ok(nuevo);
    }

    /**
     * DELETE /api/clientes/{id}
     * Eliminar un cliente (y todas sus guías por CASCADE)
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Long id) {
        clienteDao.deleteById(id);
        return ResponseEntity.ok().body("Cliente eliminado correctamente");
    }
}
```

### 7.3 ChecklistController.java - Check-list Inspección Vehicular

```java
package com.logistica.controller;

import com.logistica.dao.ChecklistDao;
import com.logistica.model.Checklist;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
public class ChecklistController {

    private final ChecklistDao checklistDao;

    public ChecklistController(ChecklistDao checklistDao) {
        this.checklistDao = checklistDao;
    }

    /**
     * GET /api/checklists
     * Listar todos los checklists (ordenados por fecha descendente)
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping
    public List<Checklist> listarChecklists() {
        return checklistDao.findAll();
    }

    /**
     * GET /api/checklists/{id}
     * Obtener un checklist por su ID
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<Checklist> obtenerChecklist(@PathVariable Long id) {
        Checklist c = checklistDao.findById(id);
        if (c != null) {
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/checklists/buscar?fecha=2024-06-15&placa=ABC123
     * Buscar checklists por fecha y/o placa (filtros)
     * Query params opcionales: fecha, placa
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/buscar")
    public List<Checklist> buscarChecklists(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String placa) {
        return checklistDao.findByFiltro(fecha, placa);
    }

    /**
     * GET /api/checklists/exportar?fechaInicio=2024-06-01&fechaFin=2024-06-30
     * Obtener checklists por rango de fechas (para imprimir o descargar PDF)
     * Query params: fechaInicio, fechaFin (formato: yyyy-MM-dd)
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/exportar")
    public List<Checklist> exportarChecklists(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        return checklistDao.findByRangoFechas(fechaInicio, fechaFin);
    }

    /**
     * POST /api/checklists
     * Crear un nuevo checklist (subir documento escaneado)
     * Requiere: Header Authorization con Bearer <token>
     * Body: { "fecha": "2024-06-15", "placa": "ABC-123", "movimiento": "Carga de cemento",
     *       "rutaArchivo": "https://r2.cloudflare.com/checklist_001.pdf",
     *       "nombreArchivo": "checklist_001.pdf" }
     */
    @PostMapping
    public ResponseEntity<Checklist> crearChecklist(@RequestBody Checklist checklist) {
        Checklist nuevo = checklistDao.save(checklist);
        return ResponseEntity.ok(nuevo);
    }

    /**
     * DELETE /api/checklists/{id}
     * Eliminar un checklist
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarChecklist(@PathVariable Long id) {
        checklistDao.deleteById(id);
        return ResponseEntity.ok().body("Checklist eliminado correctamente");
    }
}
```

### 7.4 GuiaController.java - Guías por Cliente

```java
package com.logistica.controller;

import com.logistica.dao.GuiaDao;
import com.logistica.model.Guia;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guias")
public class GuiaController {

    private final GuiaDao guiaDao;

    public GuiaController(GuiaDao guiaDao) {
        this.guiaDao = guiaDao;
    }

    /**
     * GET /api/guias
     * Listar TODAS las guías de TODOS los clientes
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping
    public List<Guia> listarTodasGuias() {
        return guiaDao.findAll();
    }

    /**
     * GET /api/guias/cliente/{idCliente}
     * Listar guías de un cliente específico (ej: CPTDC = id 1)
     * Requiere: Header Authorization con Bearer <token>
     * Response: [{ "id": 1, "numeroGuia": "G-001", "placa": "ABC-123",
     *             "nombreCliente": "CPTDC", ... }]
     */
    @GetMapping("/cliente/{idCliente}")
    public List<Guia> listarGuiasPorCliente(@PathVariable Long idCliente) {
        return guiaDao.findByClienteId(idCliente);
    }

    /**
     * GET /api/guias/{id}
     * Obtener una guía por su ID
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<Guia> obtenerGuia(@PathVariable Long id) {
        Guia g = guiaDao.findById(id);
        if (g != null) {
            return ResponseEntity.ok(g);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/guias/cliente/{idCliente}/buscar?fecha=2024-06-15&numeroGuia=G-001&placa=ABC123
     * Buscar guías de un cliente por fecha, número de guía y/o placa
     * Query params opcionales: fecha, numeroGuia, placa
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/cliente/{idCliente}/buscar")
    public List<Guia> buscarGuiasPorCliente(
            @PathVariable Long idCliente,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String numeroGuia,
            @RequestParam(required = false) String placa) {
        return guiaDao.findByFiltro(idCliente, fecha, numeroGuia, placa);
    }

    /**
     * GET /api/guias/cliente/{idCliente}/exportar?fechaInicio=2024-06-01&fechaFin=2024-06-30
     * Obtener guías de un cliente por rango de fechas (para imprimir o descargar PDF)
     * Query params: fechaInicio, fechaFin (formato: yyyy-MM-dd)
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/cliente/{idCliente}/exportar")
    public List<Guia> exportarGuiasPorCliente(
            @PathVariable Long idCliente,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        return guiaDao.findByRangoFechas(idCliente, fechaInicio, fechaFin);
    }

    /**
     * POST /api/guias
     * Crear una nueva guía (subir documento escaneado de un viaje)
     * Requiere: Header Authorization con Bearer <token>
     * Body: { "idCliente": 1, "fecha": "2024-06-15", "numeroGuia": "G-001",
     *       "placa": "ABC-123", "motivoMovimiento": "Entrega de mercancía",
     *       "rutaArchivo": "https://r2.cloudflare.com/guia_001.pdf",
     *       "nombreArchivo": "guia_001.pdf" }
     */
    @PostMapping
    public ResponseEntity<Guia> crearGuia(@RequestBody Guia guia) {
        Guia nueva = guiaDao.save(guia);
        return ResponseEntity.ok(nueva);
    }

    /**
     * DELETE /api/guias/{id}
     * Eliminar una guía
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarGuia(@PathVariable Long id) {
        guiaDao.deleteById(id);
        return ResponseEntity.ok().body("Guía eliminada correctamente");
    }
}
```

---

## 8. Archivos de Configuración

### 8.1 application.properties

```properties
server.port=8080

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/logistica_db
spring.datasource.username=postgres
spring.datasource.password=tu_password_aqui

# Virtual Threads (Java 21)
spring.threads.virtual.enabled=true

# Tamaño máximo de archivo (10MB)
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 8.2 LogisticaApiApplication.java

```java
package com.logistica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LogisticaApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LogisticaApiApplication.class, args);
    }
}
```

---

## 9. Resumen de Endpoints REST (con JWT)

| Método | Endpoint | Descripción | Requiere Token |
|--------|----------|-------------|----------------|
| **AUTH** |
| POST | `/api/auth/login` | Login, devuelve token JWT | ❌ No |
| **CLIENTES** |
| GET | `/api/clientes` | Listar todos los clientes | ✅ Sí |
| GET | `/api/clientes/{id}` | Obtener cliente por ID | ✅ Sí |
| POST | `/api/clientes` | Crear nuevo cliente | ✅ Sí |
| DELETE | `/api/clientes/{id}` | Eliminar cliente | ✅ Sí |
| **CHECKLISTS** |
| GET | `/api/checklists` | Listar todos los checklists | ✅ Sí |
| GET | `/api/checklists/{id}` | Obtener checklist por ID | ✅ Sí |
| GET | `/api/checklists/buscar` | Buscar por fecha/placa | ✅ Sí |
| GET | `/api/checklists/exportar` | Exportar por rango de fechas | ✅ Sí |
| POST | `/api/checklists` | Crear nuevo checklist | ✅ Sí |
| DELETE | `/api/checklists/{id}` | Eliminar checklist | ✅ Sí |
| **GUÍAS** |
| GET | `/api/guias` | Listar todas las guías | ✅ Sí |
| GET | `/api/guias/cliente/{idCliente}` | Listar guías de un cliente | ✅ Sí |
| GET | `/api/guias/{id}` | Obtener guía por ID | ✅ Sí |
| GET | `/api/guias/cliente/{idCliente}/buscar` | Buscar guías por filtros | ✅ Sí |
| GET | `/api/guias/cliente/{idCliente}/exportar` | Exportar guías por fechas | ✅ Sí |
| POST | `/api/guias` | Crear nueva guía | ✅ Sí |
| DELETE | `/api/guias/{id}` | Eliminar guía | ✅ Sí |

---

## 10. Cómo Funciona el JWT (Flujo Completo)

```
┌─────────────┐      POST /api/auth/login       ┌─────────────┐
│   Frontend  │ ───────────────────────────────> │   Backend   │
│  (React)    │  {username, password}             │  (Spring)   │
└─────────────┘                                  └─────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  AuthService    │
                                              │  1. Busca user  │
                                              │  2. Valida pass │
                                              │  3. Genera JWT  │
                                              └─────────────────┘
                                                        │
┌─────────────┐      {token, nombre, rol}              │
│   Frontend  │ <────────────────────────────────────┘
│  Guarda el  │
│  token en   │
│  memoria    │
└─────────────┘
       │
       │  Petición GET /api/checklists
       │  Header: Authorization: Bearer eyJhbGci...
       ▼
┌─────────────┐      ┌─────────────────────────┐     ┌─────────────┐
│   Backend   │ <─── │ JwtAuthenticationFilter │ <── │  Petición   │
│  (Spring)   │      │ 1. Lee header           │     │   HTTP      │
│  Valida     │      │ 2. Extrae token         │     │             │
│  token y    │      │ 3. Valida con JwtUtil   │     │             │
│  permite    │      │ 4. Si válido → permite  │     │             │
│  acceso     │      │ 5. Si inválido → 401    │     │             │
└─────────────┘      └─────────────────────────┘     └─────────────┘
```

---

## 11. Notas Importantes para el Desarrollador

1. **Header Authorization:** Todas las peticiones (excepto login) deben incluir:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

2. **Almacenamiento del token:** El frontend debe guardar el token en `localStorage` o `sessionStorage` después del login, y enviarlo en cada petición.

3. **Expiración:** El token dura **24 horas**. Después de eso, el usuario debe volver a iniciar sesión.

4. **Secret Key:** CAMBIAR la `SECRET` en `JwtConfig.java` antes de pasar a producción. Debe ser una cadena larga y aleatoria.

5. **Generar hash BCrypt:** Para crear las contraseñas de los usuarios iniciales:
   ```java
   BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
   System.out.println(encoder.encode("logistica2024"));
   ```

6. **Subida de archivos:** El frontend sube los archivos escaneados a server de archivos localhost , y luego envía la URL (`rutaArchivo`) al backend.

7. **PDF Unificado:** El endpoint `/exportar` devuelve la lista de documentos. El frontend (o un servicio Java adicional con `PDFBox` o `iText`) debe descargar las imágenes/PDFs de las URLs y unirlos en un solo archivo para descargar.

8. **CORS:** Ya está configurado en `SecurityConfig.java` para permitir cualquier origen. En producción, restringir al dominio exacto del frontend.
