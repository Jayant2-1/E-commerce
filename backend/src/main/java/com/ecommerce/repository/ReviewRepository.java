package com.ecommerce.repository;

import com.ecommerce.entity.Review;
import com.ecommerce.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Optional<Review> findByUserIdAndProductId(UUID userId, UUID productId);

    Page<Review> findAllByProductIdAndStatus(UUID productId, ReviewStatus status, Pageable pageable);

    @Query("select coalesce(avg(r.rating), 0), count(r) from Review r where r.product.id = :productId and r.status = :status")
    Object[] findRatingStats(@Param("productId") UUID productId, @Param("status") ReviewStatus status);
}
