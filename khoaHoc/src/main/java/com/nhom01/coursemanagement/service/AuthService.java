// service/AuthService.java
package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.*;
import com.nhom01.coursemanagement.dto.response.AuthResponse;
import com.nhom01.coursemanagement.entity.*;
import com.nhom01.coursemanagement.exception.BusinessException;
import com.nhom01.coursemanagement.repository.*;
import com.nhom01.coursemanagement.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public void register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new BusinessException("Username đã tồn tại");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("Email đã tồn tại");

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new BusinessException("Chưa khởi tạo Role STUDENT"));

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .role(studentRole)
                .build();

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(token)
                .username(req.getUsername())
                .build();
    }
}