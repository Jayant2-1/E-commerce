package com.ecommerce.dto.response;

import java.math.BigDecimal;

public record CouponValidationResponse(
        String code,
        boolean valid,
        BigDecimal discountAmount,
        BigDecimal payableAmount,
        String message
) {
}
