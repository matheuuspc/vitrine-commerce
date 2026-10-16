package com.vitrine.config;

import com.vitrine.product.Product;
import com.vitrine.product.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DemoData {
    @Bean CommandLineRunner seedProducts(ProductRepository repository) {
        return args -> {
            if (repository.count() > 0) return;
            repository.saveAll(List.of(
                new Product("Fone de Ouvido Bluetooth com Cancelamento de Ruído", "Áudio", new BigDecimal("299.90"), 12, new BigDecimal("4.8"), 342, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", "Mais vendido"),
                new Product("Smartwatch Esportivo com GPS e Monitor de Saúde", "Wearables", new BigDecimal("499.90"), 8, new BigDecimal("4.7"), 287, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85", "Novo"),
                new Product("Teclado Mecânico Gamer RGB Switch Azul", "Acessórios", new BigDecimal("349.90"), 5, new BigDecimal("4.9"), 421, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85", ""),
                new Product("Caixa de Som Portátil Bluetooth 30W", "Áudio", new BigDecimal("269.90"), 12, new BigDecimal("4.6"), 208, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85", ""),
                new Product("Câmera Instantânea com Impressão Colorida", "Fotografia", new BigDecimal("589.90"), 7, new BigDecimal("4.8"), 156, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", "Destaque"),
                new Product("Mouse Sem Fio Ergonômico de Alta Precisão", "Acessórios", new BigDecimal("189.90"), 18, new BigDecimal("4.5"), 193, "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85", ""),
                new Product("Fone Bluetooth Compacto com Estojo", "Áudio", new BigDecimal("229.90"), 0, new BigDecimal("4.6"), 124, "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85", "Esgotado"),
                new Product("Relógio Inteligente Minimalista", "Wearables", new BigDecimal("399.90"), 9, new BigDecimal("4.7"), 176, "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=900&q=85", "")
            ));
        };
    }
}
