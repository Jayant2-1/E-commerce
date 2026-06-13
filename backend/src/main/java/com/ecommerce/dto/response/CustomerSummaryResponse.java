package com.ecommerce.dto.response;

import java.util.UUID;

public record CustomerSummaryResponse(
        UUID id,
        String fullName,
        String email
) {
}
