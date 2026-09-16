package com.ecommerce.notification.controller;

import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public List<Notification> all() { return service.getAll(); }

    @GetMapping("/{id}")
    public Notification get(@PathVariable Long id) { return service.get(id); }

    @GetMapping("/order/{orderId}")
    public List<Notification> byOrderId(@PathVariable Long orderId) {
        return service.getByOrderId(orderId);
    }
}
