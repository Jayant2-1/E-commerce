package com.ecommerce.specification;

import com.ecommerce.dto.request.ProductSearchRequest;
import com.ecommerce.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> withFilters(ProductSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.active() != null) {
                predicates.add(cb.equal(root.get("active"), request.active()));
            }

            if (request.keyword() != null && !request.keyword().isBlank()) {
                String like = "%" + request.keyword().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("brand")), like),
                        cb.like(cb.lower(root.get("sku")), like)
                ));
            }

            if (request.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), request.categoryId()));
            }

            if (request.brand() != null && !request.brand().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), request.brand().trim().toLowerCase()));
            }

            if (request.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.minPrice()));
            }

            if (request.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.maxPrice()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
