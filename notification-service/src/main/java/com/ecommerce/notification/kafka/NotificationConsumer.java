package com.ecommerce.notification.kafka;
import com.ecommerce.notification.dto.OrderConfirmedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {
 @KafkaListener(topics="order-confirmed",groupId="notification-service")
 public void consume(OrderConfirmedEvent e){
   System.out.println("NOTIFICATION: Order " + e.orderId() + " confirmed. Amount: " + e.amount());
 }
}
