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
