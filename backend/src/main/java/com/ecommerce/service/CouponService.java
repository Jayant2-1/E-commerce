package com.ecommerce.service;

import com.ecommerce.dto.request.ApplyCouponRequest;
import com.ecommerce.dto.request.CouponRequest;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.dto.response.CouponValidationResponse;
import com.ecommerce.entity.Coupon;
import com.ecommerce.exception.ConflictException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String normalizedCode = request.code().trim().toUpperCase(Locale.ROOT);

        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ConflictException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(normalizedCode)
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minOrderAmount(request.minOrderAmount())
                .maxDiscountAmount(request.maxDiscountAmount())
                .usageLimit(request.usageLimit())
                .usedCount(0)
                .active(request.active())
                .expiryDate(request.expiryDate())
                .build();

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(UUID couponId, CouponRequest request) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        String normalizedCode = request.code().trim().toUpperCase(Locale.ROOT);
        couponRepository.findByCodeIgnoreCase(normalizedCode).ifPresent(existing -> {
            if (!existing.getId().equals(couponId)) {
                throw new ConflictException("Coupon code already exists");
            }
        });

        coupon.setCode(normalizedCode);
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinOrderAmount(request.minOrderAmount());
        coupon.setMaxDiscountAmount(request.maxDiscountAmount());
        coupon.setUsageLimit(request.usageLimit());
        coupon.setActive(request.active());
        coupon.setExpiryDate(request.expiryDate());

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.code().trim())
                .orElse(null);

        if (coupon == null) {
            return new CouponValidationResponse(request.code(), false, BigDecimal.ZERO, request.orderAmount(), "Coupon not found");
        }

        if (!coupon.isValid()) {
            return new CouponValidationResponse(coupon.getCode(), false, BigDecimal.ZERO, request.orderAmount(), "Coupon expired or inactive");
        }

        if (request.orderAmount().compareTo(coupon.getMinOrderAmount()) < 0) {
            return new CouponValidationResponse(
                    coupon.getCode(),
                    false,
                    BigDecimal.ZERO,
                    request.orderAmount(),
                    "Order value is below minimum amount required"
            );
        }

        BigDecimal discount = coupon.calculateDiscount(request.orderAmount());
        BigDecimal payable = request.orderAmount().subtract(discount).max(BigDecimal.ZERO);

        return new CouponValidationResponse(coupon.getCode(), true, discount, payable, "Coupon applied");
    }

    @Transactional
    public void deactivateCoupon(UUID couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> listCoupons() {
        return couponRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    private CouponResponse toResponse(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.getActive(),
                coupon.getExpiryDate()
        );
    }
}
