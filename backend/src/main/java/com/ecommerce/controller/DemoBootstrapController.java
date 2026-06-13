package com.ecommerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.config.AdminBootstrapConfig;
import com.ecommerce.dto.response.DemoBootstrapResponse;
import com.ecommerce.service.DemoBootstrapService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
public class DemoBootstrapController {

    private final DemoBootstrapService demoBootstrapService;
    private final AdminBootstrapConfig adminBootstrapConfig;

    @PostMapping("/bootstrap")
    public ResponseEntity<ApiResponse<DemoBootstrapResponse>> bootstrap(
            @RequestHeader(name = "X-Bootstrap-Key", required = false) String bootstrapKey,
            HttpServletRequest request
    ) {
        if (bootstrapKey == null || !bootstrapKey.equals(adminBootstrapConfig.getBootstrapKey())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid bootstrap key");
        }

        DemoBootstrapResponse response = demoBootstrapService.bootstrap();
        return ResponseEntity.ok(ApiResponse.success("Demo data seeded", response, request.getRequestURI()));
    }

    @PostMapping("/clear-all-carts")
    public ResponseEntity<ApiResponse<Integer>> clearAllCarts(
            @RequestHeader(name = "X-Bootstrap-Key", required = false) String bootstrapKey,
            HttpServletRequest request
    ) {
        if (bootstrapKey == null || !bootstrapKey.equals(adminBootstrapConfig.getBootstrapKey())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid bootstrap key");
        }

        int cleared = demoBootstrapService.clearAllCarts();
        return ResponseEntity.ok(ApiResponse.success("All carts cleared", cleared, request.getRequestURI()));
    }
}
