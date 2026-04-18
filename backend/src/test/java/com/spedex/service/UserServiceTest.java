package com.spedex.service;

import com.spedex.dto.AuthResponseDto;
import com.spedex.dto.LoginRequestDto;
import com.spedex.dto.SignUpRequestDto;
import com.spedex.dto.SpedexUserDto;
import com.spedex.model.User;
import com.spedex.repository.UserRepository;
import com.spedex.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setName("John Doe");
        mockUser.setEmail("john@example.com");
        mockUser.setPasswordHash("hashed_password");
        mockUser.setPlan("Premium");
        mockUser.setAvatarInitials("JD");
        mockUser.setProfilePictureUrl("url");
        mockUser.setMemberSince(LocalDateTime.now());
    }

    @Test
    void login_Success() {
        LoginRequestDto request = new LoginRequestDto();
        request.email = "john@example.com";
        request.password = "password123";

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString())).thenReturn("mock_token");

        AuthResponseDto response = userService.login(request);

        assertNotNull(response);
        assertEquals("mock_token", response.accessToken);
        assertEquals("john@example.com", response.user.email);
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        LoginRequestDto request = new LoginRequestDto();
        request.email = "notfound@example.com";
        request.password = "password123";

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginRequestDto request = new LoginRequestDto();
        request.email = "john@example.com";
        request.password = "wrongpassword";

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("Invalid password", exception.getMessage());
    }

    @Test
    void signup_Success() {
        SignUpRequestDto request = new SignUpRequestDto();
        request.name = "Jane Doe";
        request.email = "jane@example.com";
        request.password = "password123";

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(2L);
            savedUser.setMemberSince(LocalDateTime.now());
            return savedUser;
        });
        when(jwtUtil.generateToken(anyString())).thenReturn("mock_token");

        AuthResponseDto response = userService.signup(request);

        assertNotNull(response);
        assertEquals("mock_token", response.accessToken);
        assertEquals("jane@example.com", response.user.email);
        assertEquals("Jane Doe", response.user.name);
    }

    @Test
    void signup_EmailAlreadyExists_ThrowsException() {
        SignUpRequestDto request = new SignUpRequestDto();
        request.email = "john@example.com";

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));

        Exception exception = assertThrows(RuntimeException.class, () -> userService.signup(request));
        assertEquals("Email already exists", exception.getMessage());
    }

    @Test
    void findByEmail_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));

        SpedexUserDto result = userService.findByEmail("john@example.com");

        assertNotNull(result);
        assertEquals("john@example.com", result.email);
    }

    @Test
    void findByEmail_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.findByEmail("notfound@example.com"));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void updateProfile_Success() {
        SpedexUserDto updates = new SpedexUserDto();
        updates.name = "John Smith";
        updates.profilePictureUrl = "new_url";

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        SpedexUserDto result = userService.updateProfile("john@example.com", updates);

        assertNotNull(result);
        assertEquals("John Smith", result.name);
        assertEquals("new_url", result.profilePictureUrl);
    }

    @Test
    void updateProfile_UserNotFound_ThrowsException() {
        SpedexUserDto updates = new SpedexUserDto();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.updateProfile("notfound@example.com", updates));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void mapToDto_Success() {
        SpedexUserDto dto = userService.mapToDto(mockUser);

        assertNotNull(dto);
        assertEquals(mockUser.getId(), dto.id);
        assertEquals(mockUser.getName(), dto.name);
        assertEquals(mockUser.getEmail(), dto.email);
        assertEquals(mockUser.getPlan(), dto.plan);
        assertEquals(mockUser.getAvatarInitials(), dto.avatarInitials);
        assertEquals(mockUser.getProfilePictureUrl(), dto.profilePictureUrl);
        assertNotNull(dto.memberSince);
    }
}
