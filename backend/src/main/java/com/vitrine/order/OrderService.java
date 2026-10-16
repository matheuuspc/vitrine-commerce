package com.vitrine.order;

import com.vitrine.product.Product;
import com.vitrine.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Map;
import java.util.TreeMap;

@Service
public class OrderService {
    private final ProductRepository products;
    private final OrderRepository orders;
    public OrderService(ProductRepository products, OrderRepository orders) { this.products=products; this.orders=orders; }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        // Lock product rows in a stable order so concurrent checkouts cannot oversell stock.
        Map<Long,Integer> requested = new TreeMap<>();
        request.items().forEach(item -> requested.merge(item.productId(), item.quantity(), Math::addExact));
        Map<Product,Integer> locked = new TreeMap<>((a,b) -> a.getId().compareTo(b.getId()));
        for (var entry : requested.entrySet()) {
            Product product = products.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new OrderException("Produto " + entry.getKey() + " não encontrado."));
            if (entry.getValue() > product.getStock()) {
                throw new OrderException("Estoque insuficiente para " + product.getName() + ". Disponível: " + product.getStock() + ".");
            }
            locked.put(product, entry.getValue());
        }
        BigDecimal total = locked.entrySet().stream().map(entry -> entry.getKey().getPrice().multiply(BigDecimal.valueOf(entry.getValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        CustomerOrder order = new CustomerOrder(request.customerName().trim(), request.customerEmail().trim().toLowerCase(), total);
        locked.forEach((product, quantity) -> {
            product.removeStock(quantity);
            order.addItem(new OrderItem(product.getId(), product.getName(), quantity, product.getPrice()));
        });
        return OrderResponse.from(orders.save(order));
    }
}
