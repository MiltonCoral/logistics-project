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
