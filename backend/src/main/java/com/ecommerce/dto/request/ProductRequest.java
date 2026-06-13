package com.ecommerce.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 300) String slug,
        @Size(max = 10000) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        @DecimalMin(value = "0.00") BigDecimal discountPrice,
        Boolean active,
        @Size(max = 100) String brand,
        @NotBlank @Size(max = 50) String sku,
        UUID categoryId,
        List<@Size(max = 500) String> imageUrls,
        @Min(0) Integer stockQuantity,
        @Min(0) Integer lowStockThreshold
) {
}
