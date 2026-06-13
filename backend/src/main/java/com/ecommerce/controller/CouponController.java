package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.ApplyCouponRequest;
import com.ecommerce.dto.response.CouponValidationResponse;
import com.ecommerce.service.CouponService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody ApplyCouponRequest applyCouponRequest,
            HttpServletRequest request
    ) {
        CouponValidationResponse response = couponService.validateCoupon(applyCouponRequest);
        return ResponseEntity.ok(ApiResponse.success("Coupon validation completed", response, request.getRequestURI()));
    }
}
