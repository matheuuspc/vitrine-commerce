package com.vitrine.order;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="customer_orders")
public class CustomerOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String customerName;
    @Column(nullable=false) private String customerEmail;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal total;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status;
    @Column(nullable=false) private Instant createdAt;
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<OrderItem> items = new ArrayList<>();
    protected CustomerOrder() {}
    public CustomerOrder(String name,String email,BigDecimal total) { this.customerName=name; this.customerEmail=email; this.total=total; this.status=OrderStatus.CONFIRMED; this.createdAt=Instant.now(); }
    public void addItem(OrderItem item){items.add(item); item.setOrder(this);}
    public Long getId(){return id;} public String getCustomerName(){return customerName;} public String getCustomerEmail(){return customerEmail;}
    public BigDecimal getTotal(){return total;} public OrderStatus getStatus(){return status;} public Instant getCreatedAt(){return createdAt;} public List<OrderItem> getItems(){return items;}
}
