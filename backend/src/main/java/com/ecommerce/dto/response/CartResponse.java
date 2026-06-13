package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID id,
        UUID userId,
        List<CartItemResponse> items,
        Integer totalItems,
        BigDecimal subtotal,
        BigDecimal shippingAmount,
        BigDecimal totalAmount
) {
}
