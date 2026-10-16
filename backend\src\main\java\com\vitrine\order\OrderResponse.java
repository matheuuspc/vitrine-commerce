package com.vitrine.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(Long id, String customerName, String customerEmail, BigDecimal total,
                            OrderStatus status, Instant createdAt, List<Item> items) {
    public record Item(Long productId, String productName, int quantity, BigDecimal unitPrice) {}
    static OrderResponse from(CustomerOrder order) {
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getCustomerEmail(), order.getTotal(),
                order.getStatus(), order.getCreatedAt(), order.getItems().stream()
                .map(item -> new Item(item.getProductId(), item.getProductName(), item.getQuantity(), item.getUnitPrice())).toList());
    }
}
