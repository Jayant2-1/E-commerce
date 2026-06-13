package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
        UUID id,
        ProductResponse product,
        Integer quantity,
        BigDecimal priceAtAddition,
        BigDecimal subtotal
) {
}
