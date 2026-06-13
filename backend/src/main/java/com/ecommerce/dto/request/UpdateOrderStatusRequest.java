package com.ecommerce.dto.request;

import com.ecommerce.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus orderStatus) {
}
