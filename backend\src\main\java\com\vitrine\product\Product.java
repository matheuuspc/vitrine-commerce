package com.vitrine.product;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String category;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(nullable = false) private int stock;
    @Column(nullable = false, precision = 2, scale = 1) private BigDecimal rating;
    @Column(nullable = false) private int reviews;
    @Column(nullable = false, length = 600) private String image;
    private String badge;

    protected Product() {}
    public Product(String name, String category, BigDecimal price, int stock, BigDecimal rating, int reviews, String image, String badge) {
        this.name=name; this.category=category; this.price=price; this.stock=stock; this.rating=rating; this.reviews=reviews; this.image=image; this.badge=badge;
    }
    public Long getId(){return id;} public String getName(){return name;} public String getCategory(){return category;}
    public BigDecimal getPrice(){return price;} public int getStock(){return stock;} public BigDecimal getRating(){return rating;}
    public int getReviews(){return reviews;} public String getImage(){return image;} public String getBadge(){return badge;}
    public void removeStock(int quantity){ if(quantity < 1 || quantity > stock) throw new IllegalArgumentException("Estoque insuficiente para " + name + ". Disponível: " + stock + "."); stock -= quantity; }
}
