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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> searchProducts(
            @Valid @ModelAttribute ProductSearchRequest searchRequest,
            HttpServletRequest request
    ) {
        PagedResponse<ProductResponse> response = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(ApiResponse.success("Search results fetched", response, request.getRequestURI()));
    }
}
