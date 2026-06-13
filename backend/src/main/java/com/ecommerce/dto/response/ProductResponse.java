package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        BigDecimal discountPrice,
        BigDecimal effectivePrice,
        Boolean active,
        String brand,
        String sku,
        Double avgRating,
        Integer totalReviews,
        UUID categoryId,
        String categoryName,
        InventoryResponse inventory,
        List<ProductImageResponse> images
) {
}
