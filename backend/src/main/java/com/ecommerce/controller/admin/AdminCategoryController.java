package com.ecommerce.controller.admin;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.service.CategoryService;
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
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryRequest categoryRequest,
            HttpServletRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(categoryRequest);
        return ResponseEntity.ok(ApiResponse.success("Category created", response, request.getRequestURI()));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable UUID categoryId,
            @Valid @RequestBody CategoryRequest categoryRequest,
            HttpServletRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(categoryId, categoryRequest);
        return ResponseEntity.ok(ApiResponse.success("Category updated", response, request.getRequestURI()));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID categoryId,
            HttpServletRequest request
    ) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", request.getRequestURI()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list(HttpServletRequest request) {
        List<CategoryResponse> response = categoryService.getCategoryTree();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", response, request.getRequestURI()));
    }
}
