package com.ecommerce.repository;

import com.ecommerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {
    Optional<WishlistItem> findByWishlistIdAndProductId(UUID wishlistId, UUID productId);

    Optional<WishlistItem> findByIdAndWishlistId(UUID id, UUID wishlistId);
}
