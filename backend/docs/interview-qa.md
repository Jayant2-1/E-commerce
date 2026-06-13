# E-Commerce Backend Interview Q&A (30)

1. Why UUID over auto-increment IDs?
A: Better for distributed systems and avoids sequential ID exposure.

2. Why use Flyway with `ddl-auto=validate`?
A: Deterministic schema evolution and safer production rollouts.

3. Why split `inventory` from `products`?
A: Catalog is read-heavy and stable; inventory is write-heavy and volatile.

4. Why optimistic locking in inventory/order paths?
A: Prevents lost updates under concurrent writes.

5. Why JWT + refresh tokens?
A: Stateless access token scale + server revocation control via refresh token table.

6. Why use DTOs and not expose entities?
A: API contracts stay stable and security-sensitive fields stay hidden.

7. Why service layer between controller and repository?
A: Centralizes business rules and transaction boundaries.

8. Why embedded shipping address on order?
A: Historical accuracy of order state.

9. How do you prevent overselling?
A: Reservation model + transactional confirmation + optimistic lock.

10. Why `open-in-view=false`?
A: Avoid lazy-load in web layer and hidden N+1 issues.

11. Why role-based admin routes?
A: Principle of least privilege and operational separation.

12. Why MapStruct instead of manual mapping everywhere?
A: Compile-time mapper generation and lower boilerplate.

13. How is coupon abuse limited?
A: Usage counters, expiry checks, min-order constraints.

14. Why keep payment status separate from order status?
A: Payment and fulfillment lifecycles are related but distinct.

15. How do you validate verified-purchase reviews?
A: Check delivered/confirmed order linkage before accepting review.

16. Why have dedicated admin controllers?
A: Clear privilege boundary and audit-friendly API design.

17. Why index `orders(created_at)`?
A: Fast dashboard/recent-order query patterns.

18. Why use `EntityGraph` in repositories?
A: Fetch needed associations intentionally to reduce N+1.

19. Why use request validation annotations?
A: Early rejection of bad input and cleaner service logic.

20. How do you rotate refresh tokens?
A: Revoke current token and issue a new one on refresh.

21. Why have global exception handling?
A: Consistent API error contract and centralized mapping.

22. Why asynchronous notifications?
A: Keep checkout path latency low while still sending events.

23. How do you handle order cancellation restocking?
A: Reverse stock/sold counters inside transaction.

24. Why separate `/search` and `/products` APIs?
A: Supports richer query semantics without bloating CRUD endpoints.

25. Why default to immutable response records?
A: Safer API payload design and easier reasoning.

26. Why maintain both `price` and `discount_price`?
A: Preserve baseline price and support promotions cleanly.

27. How do you handle idempotency risks in payments?
A: Persist gateway IDs and verify state transitions before updates.

28. Why include schema docs and Postman in backend repo?
A: Faster onboarding and repeatable QA.

29. Why enforce admin-only inventory updates?
A: Prevent unauthorized stock tampering.

30. What would be first microservice extraction?
A: Inventory and payment domains due high-write and external integrations.
