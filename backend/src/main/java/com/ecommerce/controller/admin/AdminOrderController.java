package com.ecommerce.controller.admin;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.AdminOrderResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminOrderResponse>>> all(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Orders fetched",
                orderService.getAllOrdersForAdmin(),
                request.getRequestURI()
        ));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> byId(
            @PathVariable UUID orderId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order fetched",
                orderService.getOrderByIdForAdmin(orderId),
                request.getRequestURI()
        ));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest updateOrderStatusRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order status updated",
                orderService.updateOrderStatus(orderId, updateOrderStatusRequest.orderStatus()),
                request.getRequestURI()
        ));
    }
}
