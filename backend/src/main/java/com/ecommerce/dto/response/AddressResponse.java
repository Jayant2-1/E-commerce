package com.ecommerce.dto.response;

import com.ecommerce.enums.AddressType;

import java.util.UUID;

public record AddressResponse(
        UUID id,
        String fullName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        AddressType addressType,
        Boolean isDefault
) {
}
