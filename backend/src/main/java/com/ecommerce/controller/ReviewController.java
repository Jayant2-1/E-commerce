package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.common.PagedResponse;
import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.service.ReviewService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> upsertReview(
            @Valid @RequestBody ReviewRequest reviewRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        ReviewResponse response = reviewService.upsertReview(userId, reviewRequest);
        return ResponseEntity.ok(ApiResponse.success("Review submitted for moderation", response, request.getRequestURI()));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getApprovedReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        PagedResponse<ReviewResponse> response = reviewService.getApprovedReviews(productId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Approved reviews fetched", response, request.getRequestURI()));
    }
}
