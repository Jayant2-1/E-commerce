package com.ecommerce.dto.response;

public record ProductImageResponse(
        String imageUrl,
        String altText,
        Boolean isPrimary,
        Integer displayOrder
) {
}
