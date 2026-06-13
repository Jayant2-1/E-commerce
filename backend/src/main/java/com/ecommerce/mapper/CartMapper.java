package com.ecommerce.mapper;

import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final ProductMapper productMapper;

    public CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return null;
        }
        BigDecimal subtotal = calculateSubtotal(cart);
        BigDecimal shippingAmount = calculateShippingAmount(subtotal);
        return new CartResponse(
                cart.getId(),
                cart.getUser() == null ? null : cart.getUser().getId(),
                toItemResponseList(cart.getItems()),
                cart.getItems().stream().mapToInt(CartItem::getQuantity).sum(),
                subtotal,
                shippingAmount,
                subtotal.add(shippingAmount)
        );
    }

    public CartItemResponse toItemResponse(CartItem item) {
        if (item == null) {
            return null;
        }
        return new CartItemResponse(
                item.getId(),
                productMapper.toResponse(item.getProduct()),
                item.getQuantity(),
                item.getPriceAtAddition(),
                item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity()))
        );
    }

    public List<CartItemResponse> toItemResponseList(List<CartItem> items) {
        return items == null ? null : items.stream().map(this::toItemResponse).toList();
    }

    private BigDecimal calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateShippingAmount(BigDecimal subtotal) {
        return BigDecimal.ZERO;
    }
}
