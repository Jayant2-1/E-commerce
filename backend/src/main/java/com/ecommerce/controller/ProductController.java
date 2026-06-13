package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.common.PagedResponse;
import com.ecommerce.dto.request.ProductSearchRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(
            @PathVariable UUID productId,
            HttpServletRequest request
    ) {
        ProductResponse response = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success("Product fetched", response, request.getRequestURI()));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getBySlug(
            @PathVariable String slug,
            HttpServletRequest request
    ) {
        ProductResponse response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Product fetched", response, request.getRequestURI()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> search(
            @Valid @ModelAttribute ProductSearchRequest searchRequest,
            HttpServletRequest request
    ) {
        PagedResponse<ProductResponse> response = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(ApiResponse.success("Products fetched", response, request.getRequestURI()));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> featured(
            @RequestParam(defaultValue = "10") int limit,
            HttpServletRequest request
    ) {
        List<ProductResponse> response = productService.listFeaturedProducts(limit);
        return ResponseEntity.ok(ApiResponse.success("Featured products fetched", response, request.getRequestURI()));
    }
}
