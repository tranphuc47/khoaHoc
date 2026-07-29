package com.nhom01.coursemanagement.config;

import com.nhom01.coursemanagement.dto.request.*;
import com.nhom01.coursemanagement.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Whitelist đầy đủ các đường dẫn Swagger (thiếu swagger-ui.html là nguyên nhân gây lỗi 403)
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml",
                                "/webjars/**"
                        ).permitAll()
                        .requestMatchers("GET", "/api/categories/**").permitAll()
                        .requestMatchers("GET", "/api/courses/**").permitAll()
                        .requestMatchers("GET", "/api/chapters/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/instructor/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/courses", "/api/courses/*/chapters", "/api/chapters/*/lessons")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/courses/**", "/api/chapters/**", "/api/lessons/**")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/courses/**", "/api/chapters/**", "/api/lessons/**")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        // ===== Module 5: Enrollment =====
                // Đăng ký + xem "khóa học của tôi": chỉ cần đã đăng nhập (không giới hạn role cụ thể ở tầng URL,
                // vì STUDENT là role mặc định khi register — logic chi tiết đã kiểm tra ở Service qua getCurrentUser())
                .requestMatchers(HttpMethod.POST, "/api/enrollments").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/student/courses").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/enrollments/*/cancel").authenticated() // Student tự hủy được, check chi tiết ở Service
                .requestMatchers(HttpMethod.GET, "/api/courses/*/enrollments").hasAnyRole("ADMIN", "INSTRUCTOR")
                .requestMatchers(HttpMethod.PUT, "/api/enrollments/*/approve").hasAnyRole("ADMIN", "INSTRUCTOR")
                .requestMatchers(HttpMethod.GET, "/api/enrollments/statistics").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}