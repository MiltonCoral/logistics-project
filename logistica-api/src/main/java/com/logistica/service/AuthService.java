package com.logistica.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.logistica.dao.UsuarioDao;
import com.logistica.model.Usuario;
import com.logistica.security.JwtUtil;

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
