package com.wipro.ecom.order_management.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy; // <-- IMPORT ADDED
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // <-- IMPORT ADDED
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity // <-- ANNOTATION ADDED
@EnableMethodSecurity 
public class SecurityConfig {

    // --- DEPENDENCY INJECTION ADDED ---
    // This makes your filter available to the security chain.
    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF as we are using JWTs
            .csrf(csrf -> csrf.disable())
            
            // --- CORS CONFIGURATION SYNTAX FIXED ---
            // Apply the CORS settings from your corsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Define authorization rules
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated() // All requests to this service require authentication
            )
            
            // --- SESSION MANAGEMENT SYNTAX FIXED ---
            // Ensure sessions are stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // --- FILTER PLACEMENT SYNTAX FIXED ---
        // Add your custom JWT filter to run before the standard authentication filter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Define the allowed origins for your Angular frontend
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        
        // Define the allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Define the allowed headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        
        // Allow credentials (important for cookies, auth headers)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
