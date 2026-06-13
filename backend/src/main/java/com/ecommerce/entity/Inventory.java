package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "sold_quantity", nullable = false)
    @Builder.Default
    private Integer soldQuantity = 0;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "low_stock_threshold", nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(name = "in_stock", nullable = false)
    @Builder.Default
    private Boolean inStock = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    public int getAvailableQuantity() {
        return stockQuantity - reservedQuantity;
    }

    public boolean hasStock(int quantity) {
        return getAvailableQuantity() >= quantity;
    }

    public void reserve(int quantity) {
        this.reservedQuantity += quantity;
        updateInStock();
    }

    public void releaseReservation(int quantity) {
        this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
        updateInStock();
    }

    public void confirmSale(int quantity) {
        this.stockQuantity -= quantity;
        this.reservedQuantity -= quantity;
        this.soldQuantity += quantity;
        updateInStock();
    }

    private void updateInStock() {
        this.inStock = getAvailableQuantity() > 0;
    }
}
