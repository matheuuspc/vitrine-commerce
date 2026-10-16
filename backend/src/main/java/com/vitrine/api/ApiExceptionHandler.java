package com.vitrine.api;

import com.vitrine.order.OrderException;
import com.vitrine.newsletter.NewsletterUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(NewsletterUnavailableException.class)
    ResponseEntity<Map<String,String>> newsletterUnavailable(NewsletterUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", ex.getMessage()));
    }
    @ExceptionHandler(OrderException.class)
    ResponseEntity<Map<String,String>> orderError(OrderException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String,String>> validationError(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().findFirst().map(error -> error.getDefaultMessage()).orElse("Dados inválidos.");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
