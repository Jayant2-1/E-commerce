package com.ecommerce.mapper;

import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }
        return new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getTitle(),
                review.getBody(),
                review.getStatus(),
                review.getIsVerifiedPurchase(),
                review.getUser() == null ? null : review.getUser().getId(),
                review.getUser() == null ? null : review.getUser().getFullName(),
                review.getProduct() == null ? null : review.getProduct().getId(),
                review.getCreatedAt()
        );
    }
}
