package com.ecommerce.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.config.PaymentConfig;
import com.ecommerce.dto.request.PaymentInitiateRequest;
import com.ecommerce.dto.request.PaymentVerifyRequest;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentConfig paymentConfig;
    private final NotificationService notificationService;

    @Transactional
    public PaymentResponse initiatePayment(UUID userId, PaymentInitiateRequest request) {
        Order order = orderRepository.findByIdAndUserId(request.orderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseGet(() -> Payment.builder()
                .order(order)
                .amount(order.getFinalPrice())
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build());

        payment.setMethod(request.paymentMethod());

        if (payment.getRazorpayOrderId() == null || payment.getRazorpayOrderId().isBlank()) {
            payment.setRazorpayOrderId("rpay_order_" + UUID.randomUUID().toString().replace("-", ""));
        }

        Payment saved = paymentRepository.save(payment);
        return toResponse(saved);
    }

    @Transactional
    public PaymentResponse completeMockPayment(UUID userId, PaymentInitiateRequest request) {
        Order order = orderRepository.findByIdAndUserId(request.orderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseGet(() -> Payment.builder()
                .order(order)
                .amount(order.getFinalPrice())
                .currency("INR")
                .build());

        payment.setMethod(request.paymentMethod());
        payment.setRazorpayOrderId("mock_order_" + UUID.randomUUID().toString().replace("-", ""));
        payment.setRazorpayPaymentId("mock_payment_" + UUID.randomUUID().toString().replace("-", ""));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        order.setPaymentStatus(PaymentStatus.COMPLETED);
        if (order.getOrderStatus() == OrderStatus.PENDING) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }

        Payment savedPayment = paymentRepository.save(payment);
        Order savedOrder = orderRepository.save(order);
        notificationService.sendOrderStatusChangedNotification(savedOrder);

        return toResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse verifyPayment(UUID userId, PaymentVerifyRequest request) {
        Order order = orderRepository.findByIdAndUserId(request.orderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        if (!request.razorpayOrderId().equals(payment.getRazorpayOrderId())) {
            throw new BadRequestException("Razorpay order ID mismatch");
        }

        boolean valid = verifySignature(request.razorpayOrderId(), request.razorpayPaymentId(), request.signature());

        if (valid) {
            payment.setRazorpayPaymentId(request.razorpayPaymentId());
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            if (order.getOrderStatus() == OrderStatus.PENDING) {
                order.setOrderStatus(OrderStatus.CONFIRMED);
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
        Order savedOrder = orderRepository.save(order);
        notificationService.sendOrderStatusChangedNotification(savedOrder);

        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentForOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        return toResponse(payment);
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(paymentConfig.getSignatureSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String computed = HexFormat.of().formatHex(hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            return computed.equals(signature);
        } catch (Exception ex) {
            throw new BadRequestException("Unable to verify payment signature");
        }
    }

    private PaymentResponse toResponse(Payment payment) {
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
