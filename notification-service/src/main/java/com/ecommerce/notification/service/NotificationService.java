package com.ecommerce.notification.service;

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
        notification.setMessage(request.message());
        notification.setStatus(request.status());
        notification.setCreatedAt(LocalDateTime.now());
        return repo.save(notification);
    }

    public List<Notification> getAll() { return repo.findAll(); }

    public List<Notification> getByOrderId(Long orderId) {
        return repo.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    public Notification get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    public Notification update(Long id, NotificationRequest request) {
        Notification notification = get(id);
        notification.setOrderId(request.orderId());
        notification.setMessage(request.message());
        notification.setStatus(request.status());
        return repo.save(notification);
    }

    public void delete(Long id) { repo.delete(get(id)); }

    public Notification createOrderConfirmation(OrderConfirmedEvent event) {
        return create(new NotificationRequest(
                event.orderId(),
                "Order " + event.orderId() + " confirmed. Amount: " + event.amount(),
                "SENT"
        ));
    }
}
