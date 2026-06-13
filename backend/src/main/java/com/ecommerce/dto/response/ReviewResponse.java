package com.ecommerce.dto.response;

import com.ecommerce.enums.ReviewStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        Integer rating,
        String title,
        String body,
        ReviewStatus status,
        Boolean isVerifiedPurchase,
        UUID userId,
        String userName,
        UUID productId,
        LocalDateTime createdAt
) {
}
