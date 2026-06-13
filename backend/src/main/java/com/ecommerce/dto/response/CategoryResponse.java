package com.ecommerce.dto.response;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        UUID parentId,
        List<CategoryResponse> subCategories
) {
}
