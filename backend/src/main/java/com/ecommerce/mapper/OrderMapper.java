package com.ecommerce.mapper;

import com.ecommerce.dto.response.AdminOrderResponse;
import com.ecommerce.dto.response.CustomerSummaryResponse;
import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final AddressMapper addressMapper;

    public OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalPrice(),
                order.getDiscountAmount(),
                order.getFinalPrice(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getCoupon() == null ? null : order.getCoupon().getCode(),
                addressMapper.toShippingAddressResponse(order.getShippingAddress()),
                toItemResponseList(order.getItems()),
                toPaymentResponse(order.getPayment()),
                order.getCreatedAt()
        );
    }

    public AdminOrderResponse toAdminResponse(Order order) {
        OrderResponse response = toResponse(order);
        User user = order.getUser();
        CustomerSummaryResponse customer = user == null
                ? null
                : new CustomerSummaryResponse(user.getId(), user.getFullName(), user.getEmail());

        return new AdminOrderResponse(
                response.id(),
                response.orderNumber(),
                response.totalPrice(),
                response.discountAmount(),
                response.finalPrice(),
                response.orderStatus(),
                response.paymentStatus(),
                response.couponCode(),
                response.shippingAddress(),
                response.items(),
                response.payment(),
                response.createdAt(),
                customer
        );
    }

    public OrderItemResponse toItemResponse(OrderItem item) {
        if (item == null) {
            return null;
        }
        return new OrderItemResponse(
                item.getId(),
                item.getProduct() == null ? null : item.getProduct().getId(),
                item.getProduct() == null ? null : item.getProduct().getName(),
                item.getProduct() == null ? null : item.getProduct().getSku(),
                item.getQuantity(),
                item.getPurchasePrice(),
                item.getSubtotal()
        );
    }

    public List<OrderItemResponse> toItemResponseList(List<OrderItem> items) {
        return items == null ? null : items.stream().map(this::toItemResponse).toList();
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) {
            return null;
        }
        return new PaymentResponse(
                payment.getId(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getMethod(),
                payment.getPaidAt()
        );
    }
}
