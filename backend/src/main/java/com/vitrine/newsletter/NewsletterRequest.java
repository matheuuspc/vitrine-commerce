package com.vitrine.newsletter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record NewsletterRequest(@NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um e-mail válido.") String email) {}
