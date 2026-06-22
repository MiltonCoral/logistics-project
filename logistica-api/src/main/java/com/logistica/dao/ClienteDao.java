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
