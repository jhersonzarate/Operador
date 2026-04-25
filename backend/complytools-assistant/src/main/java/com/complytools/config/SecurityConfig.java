package com.complytools.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración de seguridad principal.
 *
 * En esta versión la API es pública (sin JWT) para facilitar el desarrollo.
 * Para producción: agregar JwtAuthenticationFilter antes de UsernamePasswordAuthenticationFilter.
 *
 * IMPORTANTE: El CorsConfigurationSource debe registrarse como @Bean separado
 * para que Spring Security lo use correctamente con cors(cors -> cors.configurationSource(...)).
 * Si no se hace así, las peticiones OPTIONS (preflight) del navegador reciben 403.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF desactivado — API REST sin sesión de servidor
            .csrf(AbstractHttpConfigurer::disable)
            // CORS con configuración explícita (no la vacía por defecto)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Todos los endpoints de la API son públicos en desarrollo
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }

    /**
     * Configuración CORS que permite peticiones desde el frontend React.
     * Sin este bean, las peticiones desde localhost:5173 reciben error CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Origen del frontend (configurable desde application.properties)
        config.setAllowedOrigins(List.of(allowedOrigins));

        // Métodos HTTP permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Headers que el frontend puede enviar
        config.setAllowedHeaders(List.of("*"));

        // Permite cookies y headers de autorización
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}