package com.ecommerce.user.service;

import com.ecommerce.user.dto.*;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.repository.UserRepository;
import com.ecommerce.user.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository repo, PasswordEncoder encoder, JwtService jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public void register(RegisterRequest r) {
        if (repo.existsByUsername(r.username())) throw new IllegalArgumentException("Username already exists");
        if (repo.existsByEmail(r.email())) throw new IllegalArgumentException("Email already exists");
        repo.save(new User(r.username(), r.email(), encoder.encode(r.password()), "USER"));
    }

    public LoginResponse login(LoginRequest r) {
        User u = repo.findByUsername(r.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!encoder.matches(r.password(), u.getPassword()))
            throw new IllegalArgumentException("Invalid username or password");
        return new LoginResponse(jwt.generate(u.getUsername(), u.getRole()), u.getUsername(), u.getRole());
    }
}
