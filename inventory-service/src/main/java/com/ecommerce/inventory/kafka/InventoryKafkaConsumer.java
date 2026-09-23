package com.ecommerce.inventory.kafka;

import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.inventory.service.InventoryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class InventoryKafkaConsumer {
    private static final Logger log = LoggerFactory.getLogger(InventoryKafkaConsumer.class);
    private final InventoryService service;

    public InventoryKafkaConsumer(InventoryService service) {
        this.service = service;
    }

    @KafkaListener(topics = "order-created", groupId = "inventory-service-v2")
    public void consume(OrderCreatedEvent event) {
        log.info("Kafka received order-created: orderId={}, userId={}", event.orderId(), event.userId());
        service.reserve(event);
    }
}
