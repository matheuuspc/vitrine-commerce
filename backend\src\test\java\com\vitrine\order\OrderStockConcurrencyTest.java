package com.vitrine.order;

import com.vitrine.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderStockConcurrencyTest {
    @Autowired TestRestTemplate http;
    @Autowired ProductRepository products;

    @Test
    void concurrentCheckoutsCannotSellTheSameUnitsTwice() throws Exception {
        var product = products.findAll().stream().filter(p -> p.getName().startsWith("Fone de Ouvido Bluetooth com Cancelamento"))
                .findFirst().orElseThrow();
        assertThat(product.getStock()).isEqualTo(12);
        var request = Map.of("customerName", "Pessoa Teste", "customerEmail", "teste@example.com",
                "items", new Object[]{Map.of("productId", product.getId(), "quantity", 8)});
        var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
        var entity = new HttpEntity<>(request, headers);
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            var first = pool.submit(() -> { start.await(); return http.postForEntity("/api/orders", entity, String.class); });
            var second = pool.submit(() -> { start.await(); return http.postForEntity("/api/orders", entity, String.class); });
            start.countDown();
            var responses = java.util.List.of(first.get(), second.get());
            assertThat(responses).extracting(ResponseEntity::getStatusCode)
                    .containsExactlyInAnyOrder(HttpStatus.CREATED, HttpStatus.CONFLICT);
        } finally { pool.shutdownNow(); }
        assertThat(products.findById(product.getId()).orElseThrow().getStock()).isEqualTo(4);
    }
}
