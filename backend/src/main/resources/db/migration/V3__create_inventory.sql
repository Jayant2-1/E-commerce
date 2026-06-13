-- =====================================================
-- V3: Inventory (separate from products for SRP)
-- =====================================================
-- INTERVIEW INSIGHT
-- Q: Why separate Inventory from Product?
-- A: Single Responsibility — product catalog data
--    (name, description, price) changes rarely.
--    Inventory data (stock, reserved) changes on
--    every order. Separating them reduces write
--    contention and makes microservice extraction
--    trivial: Product Service + Inventory Service.

CREATE TABLE inventory (
    id BINARY(16) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    sold_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) NOT NULL,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    product_id BINARY(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_inventory_product UNIQUE (product_id),
    CONSTRAINT uk_inventory_sku UNIQUE (sku),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
