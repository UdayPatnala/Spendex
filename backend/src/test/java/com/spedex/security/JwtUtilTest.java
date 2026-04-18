package com.spedex.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "1234567890123456789012345678901234567890"; // Requires >= 256 bits for HS256
    private final Long expiration = 1000 * 60 * 60L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", expiration);
    }

    @Test
    void generateToken_ShouldReturnToken() {
        String token = jwtUtil.generateToken("test@example.com");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void extractEmail_ShouldReturnCorrectEmail() {
        String email = "test@example.com";
        String token = jwtUtil.generateToken(email);

        String extractedEmail = jwtUtil.extractEmail(token);

        assertEquals(email, extractedEmail);
    }

    @Test
    void validateToken_ShouldReturnTrueForValidToken() {
        String email = "test@example.com";
        String token = jwtUtil.generateToken(email);

        boolean isValid = jwtUtil.validateToken(token, email);

        assertTrue(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalseForInvalidEmail() {
        String email = "test@example.com";
        String wrongEmail = "wrong@example.com";
        String token = jwtUtil.generateToken(email);

        boolean isValid = jwtUtil.validateToken(token, wrongEmail);

        assertFalse(isValid);
    }

    @Test
    void expiredToken_ShouldThrowException() {
        // Set negative expiration to create an already expired token
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1000L);
        String token = jwtUtil.generateToken("test@example.com");

        assertThrows(ExpiredJwtException.class, () -> {
            jwtUtil.validateToken(token, "test@example.com");
        });
    }
}
