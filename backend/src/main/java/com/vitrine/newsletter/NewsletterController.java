package com.vitrine.newsletter;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter-subscriptions")
public class NewsletterController {
    private final NewsletterService service;

    public NewsletterController(NewsletterService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody NewsletterRequest request) {
        service.subscribe(request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Cadastro realizado. Enviamos um e-mail de boas-vindas."));
    }
}
