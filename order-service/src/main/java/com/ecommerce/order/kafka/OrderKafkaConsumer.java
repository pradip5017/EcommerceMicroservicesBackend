package com.ecommerce.order.kafka;
import com.ecommerce.common.event.*;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.service.OrderService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class OrderKafkaConsumer {
 private static final Logger log = LoggerFactory.getLogger(OrderKafkaConsumer.class);
 private final OrderService service;
 public OrderKafkaConsumer(OrderService service){this.service=service;}
 @KafkaListener(topics="inventory-reserved",groupId="order-service-v2")
 public void reserved(InventoryReservedEvent e){
  log.info("Kafka received inventory-reserved: orderId={}", e.orderId());
  service.inventoryReserved(e);
 }
 @KafkaListener(topics="inventory-failed",groupId="order-service-v2")
 public void failed(OrderCreatedEvent e){service.inventoryFailed(e);}
 @KafkaListener(topics="payment-completed",groupId="order-service-v2")
 public void payment(PaymentCompletedEvent e){
  log.info("Kafka received payment-completed: orderId={}, status={}", e.orderId(), e.status());
  service.paymentCompleted(e);
 }
}
