package com.ecommerce.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ecommerce.dto.response.WishlistItemResponse;
import com.ecommerce.dto.response.WishlistResponse;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.entity.WishlistItem;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WishlistMapper {

    private final ProductMapper productMapper;

    public WishlistResponse toResponse(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }
        return new WishlistResponse(
                wishlist.getId(),
                wishlist.getUser() == null ? null : wishlist.getUser().getId(),
                wishlist.getName(),
                toItemResponseList(wishlist.getItems()),
                wishlist.getItems().size()
        );
    }

    public WishlistItemResponse toItemResponse(WishlistItem item) {
        if (item == null) {
            return null;
        }
        return new WishlistItemResponse(
                item.getId(),
                productMapper.toResponse(item.getProduct()),
                item.getAddedAt()
        );
    }

    public List<WishlistItemResponse> toItemResponseList(List<WishlistItem> items) {
        return items == null ? null : items.stream().map(this::toItemResponse).toList();
    }
}
