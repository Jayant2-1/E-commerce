package com.ecommerce.service;

import com.ecommerce.common.PagedResponse;
import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.request.ProductSearchRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductImage;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ConflictException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.specification.ProductSpecifications;
import com.ecommerce.util.PageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "price", "name", "avgRating", "totalReviews");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateUniqueFields(request.slug(), request.sku(), null);

        Category category = resolveCategory(request.categoryId());

        Product product = Product.builder()
                .name(request.name())
                .slug(request.slug())
                .description(request.description())
                .price(request.price())
                .discountPrice(request.discountPrice())
                .active(request.active() == null || request.active())
                .brand(request.brand())
                .sku(request.sku())
                .category(category)
                .images(new ArrayList<>())
                .build();

        Product saved = productRepository.save(product);

        int stockQuantity = request.stockQuantity() == null ? 0 : request.stockQuantity().intValue();
        int lowStockThreshold = request.lowStockThreshold() == null ? 10 : request.lowStockThreshold().intValue();

        Inventory inventory = Inventory.builder()
                .product(saved)
                .sku(saved.getSku())
                .stockQuantity(stockQuantity)
                .lowStockThreshold(lowStockThreshold)
                .reservedQuantity(0)
                .soldQuantity(0)
                .inStock(stockQuantity > 0)
                .build();

        inventoryRepository.save(inventory);

        applyImages(saved, request.imageUrls());
        Product reloaded = productRepository.findWithDetailsById(saved.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found after creation"));

        return productMapper.toResponse(reloaded);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        validateUniqueFields(request.slug(), request.sku(), productId);

        product.setName(request.name());
        product.setSlug(request.slug());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setDiscountPrice(request.discountPrice());
        product.setActive(request.active() == null || request.active());
        product.setBrand(request.brand());
        product.setSku(request.sku());
        product.setCategory(resolveCategory(request.categoryId()));

        product.getImages().clear();
        applyImages(product, request.imageUrls());

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder()
                        .product(product)
                        .sku(request.sku())
                        .reservedQuantity(0)
                        .soldQuantity(0)
                        .stockQuantity(0)
                        .lowStockThreshold(10)
                        .inStock(false)
                        .build());

        inventory.setSku(request.sku());

        if (request.lowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.lowStockThreshold());
        }

        if (request.stockQuantity() != null) {
            if (request.stockQuantity() < inventory.getReservedQuantity()) {
                throw new BusinessException("Stock quantity cannot be less than reserved quantity");
            }
            inventory.setStockQuantity(request.stockQuantity());
        }

        inventory.setInStock(inventory.getAvailableQuantity() > 0);

        productRepository.save(product);
        inventoryRepository.save(inventory);

        Product reloaded = productRepository.findWithDetailsById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found after update"));

        return productMapper.toResponse(reloaded);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        Product product = productRepository.findWithDetailsById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(ProductSearchRequest request) {
        String sortBy = ALLOWED_SORT_FIELDS.contains(request.normalizedSortBy()) ? request.normalizedSortBy() : "createdAt";
        Pageable pageable = PageUtils.buildPageable(
                request.normalizedPage(),
                request.normalizedSize(),
                sortBy,
                request.normalizedSortDir()
        );

        Page<ProductResponse> page = productRepository
                .findAll(ProductSpecifications.withFilters(request), pageable)
                .map(productMapper::toResponse);

        return PagedResponse.from(page);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listFeaturedProducts(int limit) {
        return productRepository.findAll().stream()
                .filter(product -> Boolean.TRUE.equals(product.getActive()))
                .sorted(Comparator.comparing(Product::getCreatedAt).reversed())
                .limit(Math.max(1, Math.min(limit, 50)))
                .map(productMapper::toResponse)
                .toList();
    }

    private Category resolveCategory(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void validateUniqueFields(String slug, String sku, UUID currentProductId) {
        productRepository.findBySlug(slug).ifPresent(existing -> {
            if (currentProductId == null || !existing.getId().equals(currentProductId)) {
                throw new ConflictException("Product slug already exists");
            }
        });

        productRepository.findBySku(sku).ifPresent(existing -> {
            if (currentProductId == null || !existing.getId().equals(currentProductId)) {
                throw new ConflictException("Product sku already exists");
            }
        });
    }

    private void applyImages(Product product, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrls.get(i))
                    .displayOrder(i)
                    .isPrimary(i == 0)
                    .build();
            product.getImages().add(image);
        }
    }
}
