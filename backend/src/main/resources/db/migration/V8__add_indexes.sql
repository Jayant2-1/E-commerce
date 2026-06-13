-- =====================================================
-- V8: Performance Indexes
-- =====================================================
-- INTERVIEW INSIGHT
-- Q: How do you decide which columns to index?
-- A: Index columns used in WHERE, JOIN, ORDER BY
--    clauses. Focus on high-cardinality columns.
--    Avoid over-indexing — each index slows writes.
--    Use EXPLAIN to validate query plans.

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Cart
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Inventory
CREATE INDEX idx_inventory_in_stock ON inventory(in_stock);

-- Addresses
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Payments
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Wishlist
CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
