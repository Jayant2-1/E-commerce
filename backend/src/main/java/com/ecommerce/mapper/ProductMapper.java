package com.ecommerce.mapper;

import com.ecommerce.dto.response.InventoryResponse;
import com.ecommerce.dto.response.ProductImageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getDiscountPrice(),
                product.getEffectivePrice(),
                product.getActive(),
                product.getBrand(),
                product.getSku(),
                product.getAvgRating(),
                product.getTotalReviews(),
                product.getCategory() == null ? null : product.getCategory().getId(),
                product.getCategory() == null ? null : product.getCategory().getName(),
                toInventoryResponse(product.getInventory()),
                toImageResponseList(product.getImages())
        );
    }

    public List<ProductResponse> toResponseList(List<Product> products) {
        return products == null ? null : products.stream().map(this::toResponse).toList();
    }

    public InventoryResponse toInventoryResponse(Inventory inventory) {
        if (inventory == null) {
            return null;
        }
        return new InventoryResponse(
                inventory.getId(),
                inventory.getSku(),
                inventory.getStockQuantity(),
                inventory.getReservedQuantity(),
                inventory.getSoldQuantity(),
                inventory.getAvailableQuantity(),
                inventory.getLowStockThreshold(),
                inventory.getInStock()
        );
    }

    public ProductImageResponse toImageResponse(ProductImage image) {
        if (image == null) {
            return null;
        }
        return new ProductImageResponse(
                image.getImageUrl(),
                image.getAltText(),
                image.getIsPrimary(),
                image.getDisplayOrder()
        );
    }

    public List<ProductImageResponse> toImageResponseList(List<ProductImage> images) {
        return images == null ? null : images.stream().map(this::toImageResponse).toList();
    }
}
