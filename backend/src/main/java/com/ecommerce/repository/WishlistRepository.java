package com.ecommerce.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.entity.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    @EntityGraph(attributePaths = {"user", "items", "items.product", "items.product.images", "items.product.inventory", "items.product.category"})
    List<Wishlist> findByUserId(UUID userId);

    @EntityGraph(attributePaths = {"user", "items", "items.product", "items.product.images", "items.product.inventory", "items.product.category"})
    Optional<Wishlist> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);

    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(UUID userId, String name, UUID id);
}