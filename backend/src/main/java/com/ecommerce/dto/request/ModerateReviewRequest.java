package com.ecommerce.dto.request;

import com.ecommerce.enums.ReviewStatus;
import jakarta.validation.constraints.NotNull;

public record ModerateReviewRequest(@NotNull ReviewStatus status) {
}
