package com.ecommerce.controller.admin;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.CouponRequest;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.service.CouponService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> create(
            @Valid @RequestBody CouponRequest couponRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon created",
                couponService.createCoupon(couponRequest),
                request.getRequestURI()
        ));
    }

    @PutMapping("/{couponId}")
    public ResponseEntity<ApiResponse<CouponResponse>> update(
            @PathVariable UUID couponId,
            @Valid @RequestBody CouponRequest couponRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon updated",
                couponService.updateCoupon(couponId, couponRequest),
                request.getRequestURI()
        ));
    }

    @DeleteMapping("/{couponId}")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable UUID couponId,
            HttpServletRequest request
    ) {
        couponService.deactivateCoupon(couponId);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated", request.getRequestURI()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> list(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupons fetched",
                couponService.listCoupons(),
                request.getRequestURI()
        ));
    }
}
