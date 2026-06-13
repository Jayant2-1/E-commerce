package com.ecommerce.service;

import com.ecommerce.dto.request.InventoryUpdateRequest;
import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.entity.Inventory;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public InventoryResponse getByProduct(UUID productId) {
        Inventory inventory = findByProductId(productId);
        return productMapper.toInventoryResponse(inventory);
    }

    @Transactional
    public InventoryResponse updateStock(InventoryUpdateRequest request) {
        Inventory inventory = findByProductId(request.productId());

        if (request.stockQuantity() < inventory.getReservedQuantity()) {
            throw new BusinessException("Stock cannot be lower than reserved quantity");
        }

        inventory.setStockQuantity(request.stockQuantity());
        inventory.setLowStockThreshold(request.lowStockThreshold());
        inventory.setInStock(inventory.getAvailableQuantity() > 0);

        return productMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Transactional
    public InventoryResponse reserveStock(UUID productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Inventory inventory = findByProductId(productId);
        if (!inventory.hasStock(quantity)) {
            throw new BusinessException("Insufficient stock available");
        }

        inventory.reserve(quantity);
        return productMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Transactional
    public InventoryResponse releaseReservation(UUID productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Inventory inventory = findByProductId(productId);
        inventory.releaseReservation(quantity);
        return productMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    private Inventory findByProductId(UUID productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
    }
}
