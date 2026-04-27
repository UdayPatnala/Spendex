package com.spedex.service;

import com.spedex.dto.AuthResponseDto;
import com.spedex.dto.LoginRequestDto;
import com.spedex.dto.SignUpRequestDto;
import com.spedex.dto.SpedexUserDto;
import com.spedex.model.User;
import com.spedex.repository.UserRepository;
import com.spedex.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, mapToDto(user));
    }

    public AuthResponseDto signup(SignUpRequestDto request) {
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPasswordHash(passwordEncoder.encode(request.password));
        
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, mapToDto(user));
    }

    public SpedexUserDto findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public SpedexUserDto updateProfile(String email, SpedexUserDto profileUpdates) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (profileUpdates.name != null) user.setName(profileUpdates.name);
        if (profileUpdates.profilePictureUrl != null) user.setProfilePictureUrl(profileUpdates.profilePictureUrl);
        
        user = userRepository.save(user);
        return mapToDto(user);
    }

    public SpedexUserDto mapToDto(User user) {
        SpedexUserDto dto = new SpedexUserDto();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.plan = user.getPlan();
        dto.avatarInitials = user.getAvatarInitials();
        dto.profilePictureUrl = user.getProfilePictureUrl();
        dto.memberSince = user.getMemberSince().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        return dto;
    }
}
