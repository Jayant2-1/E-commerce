package com.ecommerce.service;

import com.ecommerce.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationService {

    @Async
    public void sendOrderPlacedNotification(Order order) {
        log.info("Order confirmation notification queued for order={} user={}",
                order.getOrderNumber(),
                order.getUser().getEmail());
    }

    @Async
    public void sendOrderStatusChangedNotification(Order order) {
        log.info("Order status notification queued for order={} status={} user={}",
                order.getOrderNumber(),
                order.getOrderStatus(),
                order.getUser().getEmail());
    }
}
