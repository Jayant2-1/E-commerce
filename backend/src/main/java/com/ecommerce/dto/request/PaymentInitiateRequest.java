package com.ecommerce.dto.request;

import com.ecommerce.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PaymentInitiateRequest(
        @NotNull UUID orderId,
        @NotNull PaymentMethod paymentMethod
) {
}
