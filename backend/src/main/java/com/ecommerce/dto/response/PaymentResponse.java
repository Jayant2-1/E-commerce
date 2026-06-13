package com.ecommerce.dto.response;

import com.ecommerce.enums.PaymentMethod;
import com.ecommerce.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        String razorpayOrderId,
        String razorpayPaymentId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        PaymentMethod method,
        LocalDateTime paidAt
) {
}
