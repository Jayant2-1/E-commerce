package com.ecommerce.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.PaymentInitiateRequest;
import com.ecommerce.dto.request.PaymentVerifyRequest;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.service.PaymentService;
import com.ecommerce.util.SecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<java.util.List<com.ecommerce.enums.PaymentMethod>>> paymentMethods(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment methods fetched",
                java.util.Arrays.asList(com.ecommerce.enums.PaymentMethod.values()),
                request.getRequestURI()
        ));
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest paymentInitiateRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        PaymentResponse response = paymentService.initiatePayment(userId, paymentInitiateRequest);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated", response, request.getRequestURI()));
    }

    @PostMapping("/mock-complete")
    public ResponseEntity<ApiResponse<PaymentResponse>> completeMockPayment(
            @Valid @RequestBody PaymentInitiateRequest paymentInitiateRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        PaymentResponse response = paymentService.completeMockPayment(userId, paymentInitiateRequest);
        return ResponseEntity.ok(ApiResponse.success("Mock payment completed", response, request.getRequestURI()));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest paymentVerifyRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        PaymentResponse response = paymentService.verifyPayment(userId, paymentVerifyRequest);
        return ResponseEntity.ok(ApiResponse.success("Payment verification completed", response, request.getRequestURI()));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentForOrder(
            @PathVariable UUID orderId,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        PaymentResponse response = paymentService.getPaymentForOrder(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment fetched", response, request.getRequestURI()));
    }
}
