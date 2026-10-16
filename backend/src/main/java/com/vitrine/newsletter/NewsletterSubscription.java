package com.vitrine.newsletter;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "newsletter_subscriptions")
public class NewsletterSubscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false)
    private Instant subscribedAt;

    protected NewsletterSubscription() {}

    NewsletterSubscription(String email) {
        this.email = email;
        this.subscribedAt = Instant.now();
    }
}
