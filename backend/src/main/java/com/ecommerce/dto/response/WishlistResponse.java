package com.ecommerce.dto.response;

import java.util.List;
import java.util.UUID;

public record WishlistResponse(
        UUID id,
        UUID userId,
        String name,
        List<WishlistItemResponse> items,
        Integer totalItems
) {
}
