package com.ecommerce.dto.request;

import com.ecommerce.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PlaceOrderRequest(
        UUID addressId,
        @Valid ShippingAddressRequest shippingAddress,
        @Size(max = 50) String couponCode,
        @NotNull PaymentMethod paymentMethod
) {
}
