package com.spedex.controller;

import com.spedex.dto.AuthResponseDto;
import com.spedex.dto.LoginRequestDto;
import com.spedex.dto.SignUpRequestDto;
import com.spedex.dto.SpedexUserDto;
import com.spedex.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@Valid @RequestBody SignUpRequestDto request) {
        return ResponseEntity.ok(userService.signup(request));
    }

    @GetMapping("/me")
    public ResponseEntity<SpedexUserDto> me() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<SpedexUserDto> updateProfile(@RequestBody SpedexUserDto request) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }
}
