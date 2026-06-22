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
