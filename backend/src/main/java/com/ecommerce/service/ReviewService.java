package com.ecommerce.service;

import com.ecommerce.common.PagedResponse;
import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.User;
import com.ecommerce.enums.ReviewStatus;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.ReviewMapper;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final OrderService orderService;

    @Transactional
    public ReviewResponse upsertReview(UUID userId, ReviewRequest request) {
        if (!orderService.hasVerifiedPurchase(userId, request.productId())) {
            throw new BusinessException("Only verified buyers can review this product");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = reviewRepository.findByUserIdAndProductId(userId, request.productId())
                .orElseGet(() -> Review.builder()
                        .user(user)
                        .product(product)
                        .build());

        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setBody(request.body());
        review.setStatus(ReviewStatus.PENDING);
        review.setIsVerifiedPurchase(true);

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getApprovedReviews(UUID productId, int page, int size) {
        Page<ReviewResponse> responsePage = reviewRepository
                .findAllByProductIdAndStatus(productId, ReviewStatus.APPROVED, PageRequest.of(Math.max(page, 0), Math.max(size, 1)))
                .map(reviewMapper::toResponse);

        return PagedResponse.from(responsePage);
    }

    @Transactional
    public ReviewResponse moderateReview(UUID reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus(status);
        Review saved = reviewRepository.save(review);

        recalculateProductRatings(review.getProduct());

        return reviewMapper.toResponse(saved);
    }

    private void recalculateProductRatings(Product product) {
        Object[] stats = reviewRepository.findRatingStats(product.getId(), ReviewStatus.APPROVED);

        double avg = 0.0;
        int total = 0;

        if (stats != null) {
            avg = stats[0] == null ? 0.0 : ((Number) stats[0]).doubleValue();
            total = stats[1] == null ? 0 : ((Number) stats[1]).intValue();
        }

        product.setAvgRating(avg);
        product.setTotalReviews(total);
        productRepository.save(product);
    }
}
