package com.ecommerce.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ReviewRequest(
        @NotNull UUID productId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @Size(max = 200) String title,
        @Size(max = 5000) String body
) {
}
