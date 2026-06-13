package com.ecommerce.controller;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.service.AddressService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> list(HttpServletRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                "Addresses fetched",
                addressService.listUserAddresses(userId),
                request.getRequestURI()
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> add(
            @Valid @RequestBody AddressRequest addressRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        AddressResponse response = addressService.addAddress(userId, addressRequest);
        return ResponseEntity.ok(ApiResponse.success("Address added", response, request.getRequestURI()));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressRequest addressRequest,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        AddressResponse response = addressService.updateAddress(userId, addressId, addressRequest);
        return ResponseEntity.ok(ApiResponse.success("Address updated", response, request.getRequestURI()));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID addressId,
            HttpServletRequest request
    ) {
        UUID userId = SecurityUtils.currentUserId();
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", request.getRequestURI()));
    }
}
