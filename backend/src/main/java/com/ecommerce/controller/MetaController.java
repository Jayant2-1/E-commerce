package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentMethod;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/meta")
public class MetaController {

    @GetMapping("/order-statuses")
    public ResponseEntity<ApiResponse<List<OrderStatus>>> orderStatuses(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order statuses fetched",
                Arrays.asList(OrderStatus.values()),
                request.getRequestURI()
        ));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<ApiResponse<List<PaymentMethod>>> paymentMethods(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment methods fetched",
                Arrays.asList(PaymentMethod.values()),
                request.getRequestURI()
        ));
    }
}
