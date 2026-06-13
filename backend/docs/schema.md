# E-Commerce Backend Schema Notes

## Core Tables
- `users`, `addresses`, `refresh_tokens`
- `categories`, `products`, `product_images`, `inventory`
- `carts`, `cart_items`, `wishlists`, `wishlist_items`
- `orders`, `order_items`, `coupons`, `payments`, `reviews`

## Primary Key Strategy
- All entities use UUID persisted as `BINARY(16)`.
- Benefits: distributed-id safety, no enumeration-friendly integer IDs, easier multi-region merge.

## Consistency & Concurrency
- `@Version` present across entities for optimistic locking.
- Inventory reservation model:
  - add-to-cart: `reserved_quantity += qty`
  - order placement: `stock_quantity -= qty`, `reserved_quantity -= qty`, `sold_quantity += qty`
  - cart removal/update: reservation released accordingly

## Order Snapshot Model
- Shipping address is embedded in `orders` as a snapshot (`shipping_*` columns).
- Prevents historical order drift when user edits/deletes address later.

## Index Strategy (V8)
- Catalog: `products(category_id, active, brand, price)`
- Orders: `orders(user_id, order_status, created_at)`
- Reviews: `reviews(product_id, status)`
- Cart/Wishlist: `cart_items(cart_id, product_id)`, `wishlist_items(wishlist_id)`
- Inventory: `inventory(in_stock)`
- Payments: `payments(order_id, status)`
- Addresses: `addresses(user_id)`

## Operational Guidance
- Keep `ddl-auto=validate` in all non-test environments.
- Apply schema changes only via Flyway migrations.
- Treat coupon usage updates and inventory transitions as transactional writes.
