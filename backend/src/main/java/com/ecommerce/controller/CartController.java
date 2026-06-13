package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.AddCartItemRequest;
import com.ecommerce.dto.request.UpdateCartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.service.CartService;
import com.ecommerce.util.SecurityUtils;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart fetched", response, request.getRequestURI()));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Valid @RequestBody AddCartItemRequest cartItemRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        CartResponse response = cartService.addItem(userId, cartItemRequest);
        return ResponseEntity.ok(ApiResponse.success("Cart item added", response, request.getRequestURI()));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable UUID cartItemId,
            @Valid @RequestBody UpdateCartItemRequest cartItemRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        CartResponse response = cartService.updateItem(userId, cartItemId, cartItemRequest);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", response, request.getRequestURI()));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable UUID cartItemId,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        CartResponse response = cartService.removeItem(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Cart item removed", response, request.getRequestURI()));
    }
}
