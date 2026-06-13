package com.ecommerce.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ecommerce.enums.Role;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        Boolean isActive,
        Boolean isEmailVerified,
        String phone,
        String profileImageUrl,
        LocalDateTime createdAt
) {
}
