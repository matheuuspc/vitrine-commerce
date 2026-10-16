package com.vitrine.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message="Informe seu nome.") @Size(max=120) String customerName,
        @NotBlank(message="Informe seu e-mail.") @Email(message="E-mail inválido.") @Size(max=180) String customerEmail,
        @NotEmpty(message="O pedido precisa ter ao menos um produto.") @Valid List<Item> items) {
    public record Item(@NotNull @Positive Long productId, @Positive(message="A quantidade deve ser maior que zero.") int quantity) {}
}
