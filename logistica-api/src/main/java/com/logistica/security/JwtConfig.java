package com.logistica.security;

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
