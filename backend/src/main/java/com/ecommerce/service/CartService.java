package com.ecommerce.service;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.request.AddCartItemRequest;
import com.ecommerce.dto.request.UpdateCartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.CartMapper;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(UUID userId, AddCartItemRequest request) {
        if (request.quantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Cart cart = findOrCreateCart(userId);
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessException("Product is not active");
        }

        Inventory inventory = findInventory(product.getId());
        if (!inventory.hasStock(request.quantity())) {
            throw new BusinessException("Insufficient stock for product");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .priceAtAddition(product.getEffectivePrice())
                        .quantity(0)
                        .build());

        item.setQuantity(item.getQuantity() + request.quantity());
        cartItemRepository.save(item);

        inventory.reserve(request.quantity());
        inventoryRepository.save(inventory);

        return cartMapper.toResponse(reloadCart(userId));
    }

    @Transactional
    public CartResponse updateItem(UUID userId, UUID cartItemId, UpdateCartItemRequest request) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cartItemRepository.findByIdAndCartId(cartItemId, cart.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        int oldQuantity = item.getQuantity();
        int newQuantity = request.quantity();
        int delta = newQuantity - oldQuantity;

        Inventory inventory = findInventory(item.getProduct().getId());

        if (delta > 0) {
            if (!inventory.hasStock(delta)) {
                throw new BusinessException("Insufficient stock to increase quantity");
            }
            inventory.reserve(delta);
        } else if (delta < 0) {
            inventory.releaseReservation(Math.abs(delta));
        }

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
        inventoryRepository.save(inventory);

        return cartMapper.toResponse(reloadCart(userId));
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID cartItemId) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cartItemRepository.findByIdAndCartId(cartItemId, cart.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        Inventory inventory = findInventory(item.getProduct().getId());
        inventory.releaseReservation(item.getQuantity());

        cartItemRepository.delete(item);
        inventoryRepository.save(inventory);

        return cartMapper.toResponse(reloadCart(userId));
    }

    private Cart findOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
    }

    private Cart createCartForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = Cart.builder().user(user).items(new ArrayList<>()).build();
        return cartRepository.save(cart);
    }

    private Inventory findInventory(UUID productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
    }

    private Cart reloadCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
    }
}
