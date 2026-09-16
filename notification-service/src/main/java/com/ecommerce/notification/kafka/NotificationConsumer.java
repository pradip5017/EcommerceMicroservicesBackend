package com.ecommerce.notification.kafka;
import com.ecommerce.common.event.OrderConfirmedEvent;
import com.ecommerce.notification.service.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {
 private final NotificationService service;
 public NotificationConsumer(NotificationService service){this.service=service;}
 @KafkaListener(topics="order-confirmed",groupId="notification-service-v2")
 public void consume(OrderConfirmedEvent e){
   service.createOrderConfirmation(e);
 }
}
