package com.ecommerce.inventory.kafka;
import com.ecommerce.inventory.dto.OrderCreatedEvent;
import com.ecommerce.inventory.service.InventoryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class InventoryKafkaConsumer {
 private final InventoryService service;
 public InventoryKafkaConsumer(InventoryService service){this.service=service;}
 @KafkaListener(topics="order-created",groupId="inventory-service")
 public void consume(OrderCreatedEvent event){service.reserve(event);}
}
