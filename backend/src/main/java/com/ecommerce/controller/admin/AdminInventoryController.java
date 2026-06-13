package com.ecommerce.controller.admin;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.InventoryUpdateRequest;
import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getByProduct(
            @PathVariable UUID productId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory fetched",
                inventoryService.getByProduct(productId),
                request.getRequestURI()
        ));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<InventoryResponse>> update(
            @Valid @RequestBody InventoryUpdateRequest inventoryUpdateRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory updated",
                inventoryService.updateStock(inventoryUpdateRequest),
                request.getRequestURI()
        ));
    }
}
