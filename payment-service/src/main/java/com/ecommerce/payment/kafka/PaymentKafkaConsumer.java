package com.ecommerce.payment.kafka;
import com.ecommerce.common.event.InventoryReservedEvent;
import com.ecommerce.payment.service.PaymentService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentKafkaConsumer {
 private final PaymentService service;
 public PaymentKafkaConsumer(PaymentService service){this.service=service;}
 @KafkaListener(topics="inventory-reserved-for-payment",groupId="payment-service-v2")
 public void consume(InventoryReservedEvent e){service.process(e);}
}
