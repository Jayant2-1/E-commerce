package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.PlaceOrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.service.OrderService;
import com.ecommerce.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest placeOrderRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        OrderResponse response = orderService.placeOrder(userId, placeOrderRequest);
        return ResponseEntity.ok(ApiResponse.success("Order placed", response, request.getRequestURI()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        List<OrderResponse> response = orderService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.success("Orders fetched", response, request.getRequestURI()));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable UUID orderId,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        OrderResponse response = orderService.getOrderById(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Order fetched", response, request.getRequestURI()));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable UUID orderId,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        orderService.cancelOrder(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", request.getRequestURI()));
    }
}
