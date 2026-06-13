package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdAndUserId(UUID id, UUID userId);

    @EntityGraph(attributePaths = {"items", "items.product", "coupon", "payment"})
    Optional<Order> findWithDetailsById(UUID id);

    @EntityGraph(attributePaths = {"items", "items.product", "coupon", "payment"})
    List<Order> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"items", "items.product", "coupon", "payment", "user"})
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetailsOrderByCreatedAtDesc();

    long countByOrderStatus(OrderStatus status);

    boolean existsByUserIdAndItemsProductIdAndOrderStatusIn(UUID userId, UUID productId, List<OrderStatus> statuses);
}
