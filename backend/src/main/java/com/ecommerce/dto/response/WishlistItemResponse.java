package com.ecommerce.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record WishlistItemResponse(
        UUID id,
        ProductResponse product,
        LocalDateTime addedAt
) {
}
