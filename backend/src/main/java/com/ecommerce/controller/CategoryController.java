package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.service.CategoryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> tree(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category tree fetched",
                categoryService.getCategoryTree(),
                request.getRequestURI()
        ));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(
            @PathVariable UUID categoryId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category fetched",
                categoryService.getCategory(categoryId),
                request.getRequestURI()
        ));
    }
}
