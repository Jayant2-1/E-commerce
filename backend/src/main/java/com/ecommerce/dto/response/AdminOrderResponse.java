package com.ecommerce.dto.response;

import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AdminOrderResponse(
        UUID id,
        String orderNumber,
        BigDecimal totalPrice,
        BigDecimal discountAmount,
        BigDecimal finalPrice,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        String couponCode,
        ShippingAddressResponse shippingAddress,
        List<OrderItemResponse> items,
        PaymentResponse payment,
        LocalDateTime createdAt,
        CustomerSummaryResponse customer
) {
}
