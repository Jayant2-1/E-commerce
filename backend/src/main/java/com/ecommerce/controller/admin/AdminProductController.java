package com.ecommerce.controller.admin;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.common.PagedResponse;
import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.request.ProductSearchRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest productRequest,
            HttpServletRequest request
    ) {
        ProductResponse response = productService.createProduct(productRequest);
        return ResponseEntity.ok(ApiResponse.success("Product created", response, request.getRequestURI()));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable UUID productId,
            @Valid @RequestBody ProductRequest productRequest,
            HttpServletRequest request
    ) {
        ProductResponse response = productService.updateProduct(productId, productRequest);
        return ResponseEntity.ok(ApiResponse.success("Product updated", response, request.getRequestURI()));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID productId,
            HttpServletRequest request
    ) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", request.getRequestURI()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> search(
            @Valid @ModelAttribute ProductSearchRequest searchRequest,
            HttpServletRequest request
    ) {
        PagedResponse<ProductResponse> response = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(ApiResponse.success("Products fetched", response, request.getRequestURI()));
    }
}
