package com.ecommerce.notification.kafka;
import com.ecommerce.common.event.OrderConfirmedEvent;
import com.ecommerce.notification.service.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class NotificationConsumer {
 private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);
 private final NotificationService service;
 public NotificationConsumer(NotificationService service){this.service=service;}

 @KafkaListener(topics="order-confirmed",groupId="notification-service-v2")
 public void consumeOrderConfirmed(OrderConfirmedEvent e){
   service.createOrderConfirmation(e);
   log.info("Kafka received order-confirmed and created notification: orderId={}, userId={}", e.orderId(), e.userId());
 }

 @KafkaListener(topics="payment-successful",groupId="notification-service-v2")
 public void consumePaymentSuccessful(OrderConfirmedEvent e){
   service.createPaymentSuccess(e);
   log.info("Kafka received payment-successful and created notification: orderId={}, userId={}", e.orderId(), e.userId());
 }
}
