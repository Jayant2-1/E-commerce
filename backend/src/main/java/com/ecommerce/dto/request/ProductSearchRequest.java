package com.ecommerce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSearchRequest(
        @Size(max = 200) String keyword,
        UUID categoryId,
        @Size(max = 100) String brand,
        @DecimalMin(value = "0.00") BigDecimal minPrice,
        @DecimalMin(value = "0.00") BigDecimal maxPrice,
        Boolean active,
        String sortBy,
        String sortDir,
        @Min(0) Integer page,
        @Min(1) Integer size
) {
    public int normalizedPage() {
        return page == null ? 0 : page;
    }

    public int normalizedSize() {
        return size == null ? 20 : Math.min(size, 100);
    }

    public String normalizedSortBy() {
        return (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
    }

    public String normalizedSortDir() {
        return (sortDir == null || sortDir.isBlank()) ? "desc" : sortDir;
    }
}
