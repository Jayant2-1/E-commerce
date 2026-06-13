package com.ecommerce.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.response.WishlistResponse;
import com.ecommerce.service.WishlistService;
import com.ecommerce.util.SecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getAllWishlists(
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        List<WishlistResponse> response = wishlistService.getAllWishlists(userId);
        return ResponseEntity.ok(ApiResponse.success("Wishlists fetched", response, request.getRequestURI()));
    }

    @GetMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(
            @PathVariable UUID wishlistId,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        WishlistResponse response = wishlistService.getWishlist(userId, wishlistId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched", response, request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> createWishlist(
            @Valid @RequestBody CreateWishlistRequest body,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        WishlistResponse response = wishlistService.createWishlist(userId, body.name());
        return ResponseEntity.ok(ApiResponse.success("Wishlist created", response, request.getRequestURI()));
    }

    @PutMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> renameWishlist(
            @PathVariable UUID wishlistId,
            @Valid @RequestBody CreateWishlistRequest body,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        WishlistResponse response = wishlistService.renameWishlist(userId, wishlistId, body.name());
        return ResponseEntity.ok(ApiResponse.success("Wishlist renamed", response, request.getRequestURI()));
    }

    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<Void>> deleteWishlist(
            @PathVariable UUID wishlistId,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        wishlistService.deleteWishlist(userId, wishlistId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist deleted", request.getRequestURI()));
    }

    @PostMapping("/{wishlistId}/items/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> addItem(
            @PathVariable UUID wishlistId,
            @PathVariable UUID productId,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        WishlistResponse response = wishlistService.addItem(userId, wishlistId, productId);
        return ResponseEntity.ok(ApiResponse.success("Item added to wishlist", response, request.getRequestURI()));
    }

    @DeleteMapping("/{wishlistId}/items/{wishlistItemId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeItem(
            @PathVariable UUID wishlistId,
            @PathVariable UUID wishlistItemId,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        WishlistResponse response = wishlistService.removeItem(userId, wishlistId, wishlistItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from wishlist", response, request.getRequestURI()));
    }

    @PostMapping("/{wishlistId}/items/{wishlistItemId}/move-to-cart")
    public ResponseEntity<ApiResponse<WishlistResponse>> moveToCart(
            @PathVariable UUID wishlistId,
            @PathVariable UUID wishlistItemId,
            @RequestParam(defaultValue = "1") int quantity,
            HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        WishlistResponse response = wishlistService.moveToCart(userId, wishlistId, wishlistItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Item moved to cart", response, request.getRequestURI()));
    }

    public record CreateWishlistRequest(
            @NotBlank(message = "Wishlist name is required")
            @Size(max = 100, message = "Wishlist name must be 100 characters or less")
            String name
    ) {}
}