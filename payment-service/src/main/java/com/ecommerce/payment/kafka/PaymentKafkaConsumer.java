package com.ecommerce.payment.kafka;
import com.ecommerce.common.event.InventoryReservedEvent;
import com.ecommerce.payment.service.PaymentService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class PaymentKafkaConsumer {
 private static final Logger log = LoggerFactory.getLogger(PaymentKafkaConsumer.class);
 private final PaymentService service;
 public PaymentKafkaConsumer(PaymentService service){this.service=service;}
 @KafkaListener(topics="inventory-reserved-for-payment",groupId="payment-service-v2")
 public void consume(InventoryReservedEvent e){
  log.info("Kafka received inventory-reserved-for-payment: orderId={}", e.orderId());
  service.process(e);
 }
}
