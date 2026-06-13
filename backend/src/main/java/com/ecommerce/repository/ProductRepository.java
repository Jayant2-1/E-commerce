package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    boolean existsBySlug(String slug);

    boolean existsBySku(String sku);

    @EntityGraph(attributePaths = {"images", "inventory", "category"})
    Optional<Product> findWithDetailsById(UUID id);

    @EntityGraph(attributePaths = {"images", "inventory", "category"})
    List<Product> findAllByIdIn(List<UUID> ids);
}
