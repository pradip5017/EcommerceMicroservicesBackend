package com.ecommerce.notification.service;

import com.ecommerce.common.event.OrderCancelledEvent;
import com.ecommerce.common.event.OrderConfirmedEvent;
import com.ecommerce.notification.dto.NotificationRequest;
import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    public Notification create(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setOrderId(request.orderId());
        notification.setUserId(request.userId());
        notification.setMessage(request.message());
        notification.setStatus(request.status());
        notification.setCreatedAt(LocalDateTime.now());
        return repo.save(notification);
    }

    public List<Notification> getAll() { return repo.findAll(); }

    public List<Notification> getByOrderId(Long orderId) {
        return repo.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    public List<Notification> getByUserId(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    public Notification update(Long id, NotificationRequest request) {
        Notification notification = get(id);
        notification.setOrderId(request.orderId());
        notification.setUserId(request.userId());
        notification.setMessage(request.message());
        notification.setStatus(request.status());
        return repo.save(notification);
    }

    public void delete(Long id) { repo.delete(get(id)); }

    public Notification createOrderConfirmation(OrderConfirmedEvent event) {
        String message = "Your order " + event.orderId() + " has been confirmed. Amount: " + event.amount();

        return create(new NotificationRequest(
                event.orderId(),
                event.userId(),
                message,
                "SENT"
        ));
    }

    public Notification createPaymentSuccess(OrderConfirmedEvent event) {
        String message = "Payment successful! Your order " + event.orderId()
                + " has been paid successfully. Amount: " + event.amount();

        return create(new NotificationRequest(
                event.orderId(),
                event.userId(),
                message,
                "SENT"
        ));
    }

    public Notification createPaymentFailed(OrderCancelledEvent event) {
        String message = "Payment failed for your order " + event.orderId()
                + " because of a payment, bank, or server problem. "
                + "Please try again. Amount: " + event.amount();

        return create(new NotificationRequest(
                event.orderId(),
                event.userId(),
                message,
                "SENT"
        ));
    }

    public Notification createOrderCancelled(OrderCancelledEvent event) {
        String message = "Your order " + event.orderId()
                + " has been cancelled. Reason: " + event.reason();

        return create(new NotificationRequest(
                event.orderId(),
                event.userId(),
                message,
                "SENT"
        ));
    }
}
