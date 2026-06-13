package com.ecommerce.service;

import com.ecommerce.dto.request.PlaceOrderRequest;
import com.ecommerce.dto.response.AdminOrderResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Coupon;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.ShippingAddress;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.BusinessException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.AddressMapper;
import com.ecommerce.mapper.OrderMapper;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.CouponRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.OrderNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final List<OrderStatus> PURCHASED_STATUSES = List.of(
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.RETURNED
    );

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final InventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponse placeOrder(UUID userId, PlaceOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot place order with empty cart");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal totalPrice = cart.getItems().stream()
                .map(item -> item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CouponContext couponContext = applyCouponIfPresent(request.couponCode(), totalPrice);

        ShippingAddress shippingAddress = resolveShippingAddress(userId, request);

        Order order = Order.builder()
                .orderNumber(OrderNumberGenerator.nextOrderNumber())
                .totalPrice(totalPrice)
                .discountAmount(couponContext.discountAmount())
                .finalPrice(totalPrice.subtract(couponContext.discountAmount()))
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress(shippingAddress)
                .coupon(couponContext.coupon())
                .user(user)
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Inventory inventory = inventoryRepository.findByProductId(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));

            int requiredQty = cartItem.getQuantity();
            if (inventory.getReservedQuantity() < requiredQty) {
                int missingReserve = requiredQty - inventory.getReservedQuantity();
                if (!inventory.hasStock(missingReserve)) {
                    throw new BusinessException("Insufficient stock for product: " + cartItem.getProduct().getName());
                }
                inventory.reserve(missingReserve);
            }

            inventory.confirmSale(requiredQty);
            inventoryRepository.save(inventory);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .quantity(requiredQty)
                    .purchasePrice(cartItem.getPriceAtAddition())
                    .subtotal(cartItem.getPriceAtAddition().multiply(BigDecimal.valueOf(requiredQty)))
                    .build();

            orderItems.add(orderItem);
        }

        savedOrder.getItems().addAll(orderItems);

        Payment payment = Payment.builder()
                .order(savedOrder)
                .amount(savedOrder.getFinalPrice())
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .method(request.paymentMethod())
                .build();
        savedOrder.setPayment(payment);

        Order finalizedOrder = orderRepository.save(savedOrder);

        cartItemRepository.deleteAllByCartId(cart.getId());

        notificationService.sendOrderPlacedNotification(finalizedOrder);

        return orderMapper.toResponse(orderRepository.findWithDetailsById(finalizedOrder.getId())
                .orElse(finalizedOrder));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(UUID userId) {
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAllWithDetailsOrderByCreatedAtDesc().stream()
                .map(orderMapper::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForAdmin(UUID orderId) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrderStatus(status);

        if (status == OrderStatus.DELIVERED && order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.COMPLETED);
        }

        if (status == OrderStatus.CANCELLED) {
            restockItems(order);
        }

        Order saved = orderRepository.save(order);
        notificationService.sendOrderStatusChangedNotification(saved);

        return orderMapper.toResponse(saved);
    }

    @Transactional
    public void cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.CANCELLED || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Order cannot be cancelled at this stage");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        restockItems(order);

        Order saved = orderRepository.save(order);
        notificationService.sendOrderStatusChangedNotification(saved);
    }

    private CouponContext applyCouponIfPresent(String couponCode, BigDecimal totalPrice) {
        if (couponCode == null || couponCode.isBlank()) {
            return new CouponContext(null, BigDecimal.ZERO);
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new BadRequestException("Coupon does not exist"));

        if (!coupon.isValid()) {
            throw new BusinessException("Coupon is expired or inactive");
        }

        if (totalPrice.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException("Order amount is below coupon minimum amount");
        }

        BigDecimal discount = coupon.calculateDiscount(totalPrice);
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return new CouponContext(coupon, discount);
    }

    private ShippingAddress resolveShippingAddress(UUID userId, PlaceOrderRequest request) {
        if (request.addressId() != null) {
            Address address = addressRepository.findByIdAndUserId(request.addressId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
            return addressMapper.toShippingAddress(address);
        }

        if (request.shippingAddress() != null) {
            return addressMapper.toShippingAddress(request.shippingAddress());
        }

        throw new BadRequestException("Either addressId or shippingAddress must be provided");
    }

    private void restockItems(Order order) {
        for (OrderItem item : order.getItems()) {
            Inventory inventory = inventoryRepository.findByProductId(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
            inventory.setStockQuantity(inventory.getStockQuantity() + item.getQuantity());
            inventory.setSoldQuantity(Math.max(0, inventory.getSoldQuantity() - item.getQuantity()));
            inventory.setInStock(inventory.getAvailableQuantity() > 0);
            inventoryRepository.save(inventory);
        }
    }

    public boolean hasVerifiedPurchase(UUID userId, UUID productId) {
        return orderRepository.existsByUserIdAndItemsProductIdAndOrderStatusIn(userId, productId, PURCHASED_STATUSES);
    }

    private record CouponContext(Coupon coupon, BigDecimal discountAmount) {
    }
}
