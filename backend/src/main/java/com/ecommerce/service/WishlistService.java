package com.ecommerce.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.request.AddCartItemRequest;
import com.ecommerce.dto.response.WishlistResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.entity.WishlistItem;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ConflictException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.WishlistMapper;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistItemRepository;
import com.ecommerce.repository.WishlistRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final WishlistMapper wishlistMapper;

    @Transactional
    public List<WishlistResponse> getAllWishlists(UUID userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        if (wishlists.isEmpty()) {
            Wishlist defaultWishlist = createDefaultWishlist(userId, "My Wishlist");
            wishlists = List.of(defaultWishlist);
        }
        return wishlists.stream().map(wishlistMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(UUID userId, UUID wishlistId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));
        return wishlistMapper.toResponse(wishlist);
    }

    @Transactional
    public WishlistResponse createWishlist(UUID userId, String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Wishlist name is required");
        }
        String trimmed = name.trim();
        if (trimmed.length() > 100) {
            throw new BadRequestException("Wishlist name must be 100 characters or less");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean exists = wishlistRepository.existsByUserIdAndNameIgnoreCase(userId, trimmed);
        if (exists) {
            throw new ConflictException("A wishlist with this name already exists");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .name(trimmed)
                .items(new ArrayList<>())
                .build();
        return wishlistMapper.toResponse(wishlistRepository.save(wishlist));
    }

    @Transactional
    public WishlistResponse renameWishlist(UUID userId, UUID wishlistId, String newName) {
        if (newName == null || newName.isBlank()) {
            throw new BadRequestException("Wishlist name is required");
        }
        String trimmed = newName.trim();
        if (trimmed.length() > 100) {
            throw new BadRequestException("Wishlist name must be 100 characters or less");
        }

        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        boolean exists = wishlistRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(userId, trimmed, wishlistId);
        if (exists) {
            throw new ConflictException("A wishlist with this name already exists");
        }

        wishlist.setName(trimmed);
        return wishlistMapper.toResponse(wishlistRepository.save(wishlist));
    }

    @Transactional
    public void deleteWishlist(UUID userId, UUID wishlistId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));
        wishlistRepository.delete(wishlist);
    }

    @Transactional
    public WishlistResponse addItem(UUID userId, UUID wishlistId, UUID productId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessException("Product is not active");
        }

        boolean exists = wishlistItemRepository.findByWishlistIdAndProductId(wishlist.getId(), productId).isPresent();
        if (!exists) {
            wishlistItemRepository.save(WishlistItem.builder().wishlist(wishlist).product(product).build());
        }

        return wishlistMapper.toResponse(reloadWishlist(wishlist.getId()));
    }

    @Transactional
    public WishlistResponse removeItem(UUID userId, UUID wishlistId, UUID wishlistItemId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        WishlistItem item = wishlistItemRepository.findByIdAndWishlistId(wishlistItemId, wishlist.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        wishlistItemRepository.delete(item);
        return wishlistMapper.toResponse(reloadWishlist(wishlist.getId()));
    }

    @Transactional
    public WishlistResponse moveToCart(UUID userId, UUID wishlistId, UUID wishlistItemId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        WishlistItem item = wishlistItemRepository.findByIdAndWishlistId(wishlistItemId, wishlist.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        cartService.addItem(userId, new AddCartItemRequest(item.getProduct().getId(), quantity));
        wishlistItemRepository.delete(item);

        return wishlistMapper.toResponse(reloadWishlist(wishlist.getId()));
    }

    private Wishlist createDefaultWishlist(UUID userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Wishlist wishlist = Wishlist.builder().user(user).name(name).items(new ArrayList<>()).build();
        return wishlistRepository.save(wishlist);
    }

    private Wishlist reloadWishlist(UUID wishlistId) {
        return wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));
    }
}