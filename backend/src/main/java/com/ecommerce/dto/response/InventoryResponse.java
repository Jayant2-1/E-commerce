package com.ecommerce.dto.response;

import java.util.UUID;

public record InventoryResponse(
        UUID id,
        String sku,
        Integer stockQuantity,
        Integer reservedQuantity,
        Integer soldQuantity,
        Integer availableQuantity,
        Integer lowStockThreshold,
        Boolean inStock
) {
}
