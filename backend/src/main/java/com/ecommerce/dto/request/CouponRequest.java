package com.ecommerce.dto.request;

import com.ecommerce.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CouponRequest(
        @NotBlank String code,
        @NotNull DiscountType discountType,
        @NotNull @DecimalMin(value = "0.01") BigDecimal discountValue,
        @NotNull @DecimalMin(value = "0.00") BigDecimal minOrderAmount,
        @DecimalMin(value = "0.00") BigDecimal maxDiscountAmount,
        @NotNull @Min(0) Integer usageLimit,
        @NotNull Boolean active,
        @NotNull @Future LocalDateTime expiryDate
) {
}
