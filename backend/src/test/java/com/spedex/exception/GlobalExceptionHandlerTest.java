package com.spedex.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleRuntimeException_NotFound_ReturnsUnauthorized() {
        String message = "User not found";
        RuntimeException exception = new RuntimeException(message);

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleRuntimeException(exception);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Incorrect email or password.", response.getBody().get("detail"));
    }

    @Test
    void handleRuntimeException_InvalidCredentials_ReturnsUnauthorized() {
        String message = "Invalid credentials";
        RuntimeException exception = new RuntimeException(message);

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleRuntimeException(exception);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Authentication failed", response.getBody().get("detail"));
    }

    @Test
    void handleRuntimeException_Exists_ReturnsConflict() {
        String message = "User already exists";
        RuntimeException exception = new RuntimeException(message);

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleRuntimeException(exception);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An account with this email already exists.", response.getBody().get("detail"));
    }

    @Test
    void handleRuntimeException_OtherMessage_ReturnsInternalServerError() {
        String message = "Database connection failed";
        RuntimeException exception = new RuntimeException(message);

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleRuntimeException(exception);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred", response.getBody().get("detail"));
    }
}
