package com.spedex.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = error instanceof FieldError fieldError ? fieldError.getField() : "detail";
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        logger.error("Unhandled RuntimeException", e);
        
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = "An unexpected error occurred";

        if (e.getMessage() != null) {
            String lowerCaseMsg = e.getMessage().toLowerCase();
            if (lowerCaseMsg.contains("unauthorized") || lowerCaseMsg.contains("credentials")) {
                status = HttpStatus.UNAUTHORIZED;
                message = "Authentication failed";
            } else if (lowerCaseMsg.contains("not found") || lowerCaseMsg.contains("invalid password")) {
                // Treat "user not found" and "invalid password" both as 401 so
                // the frontend shows a clear auth-failure message instead of a
                // generic 404 "resource not found" hint.
                status = HttpStatus.UNAUTHORIZED;
                message = "Incorrect email or password.";
            } else if (lowerCaseMsg.contains("exists")) {
                status = HttpStatus.CONFLICT;
                message = "An account with this email already exists.";
            } else if (lowerCaseMsg.contains("invalid") || lowerCaseMsg.contains("missing")) {
                status = HttpStatus.BAD_REQUEST;
                message = "Invalid request";
            }
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("detail", message);

        return new ResponseEntity<>(error, status);
    }
}
