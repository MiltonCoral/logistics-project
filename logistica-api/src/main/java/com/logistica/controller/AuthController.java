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
