package com.ecommerce.dto.response;

public record ShippingAddressResponse(
        String fullName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country
) {
}
