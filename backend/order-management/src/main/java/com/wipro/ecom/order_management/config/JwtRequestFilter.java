package com.wipro.ecom.order_management.config;

import com.wipro.ecom.order_management.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.extractUsername(jwt);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt)) {
                String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
                
                // --- CHANGE 1: ADDED DEBUG LINE FOR THE ROLE ---
                System.out.println("======> Role Extracted from Token: [" + role + "] <======");

                Integer userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", Integer.class));
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                // --- CHANGE 2: ADDED DEBUG LINE FOR THE AUTHORITY ---
                System.out.println("======> Authority Created: [" + authority.getAuthority() + "] <======");

                // Here we use the user's ID as the principal
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.singletonList(authority));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }
}
