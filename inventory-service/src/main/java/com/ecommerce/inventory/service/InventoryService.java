package com.ecommerce.inventory.service;

import com.ecommerce.common.event.*;
import com.ecommerce.inventory.dto.*;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
    private final InventoryRepository repo;
    private final KafkaTemplate<String, Object> kafka;

    public InventoryService(InventoryRepository repo, KafkaTemplate<String, Object> kafka) {
        this.repo = repo;
        this.kafka = kafka;
    }

    public Inventory create(InventoryRequest r) {
        Inventory i = repo.findByProductId(r.productId()).orElseGet(Inventory::new);
        i.setProductId(r.productId());
        i.setAvailableQuantity(r.quantity());
        return repo.save(i);
    }

    public void reserve(OrderCreatedEvent e) {
        Inventory i = repo.findByProductId(e.productId()).orElse(null);
        if (i == null || i.getAvailableQuantity() < e.quantity()) {
            kafka.send("inventory-failed", String.valueOf(e.orderId()), e);
            return;
        }
        i.setAvailableQuantity(i.getAvailableQuantity() - e.quantity());
        repo.save(i);
        kafka.send("inventory-reserved", String.valueOf(e.orderId()),
                new InventoryReservedEvent(e.orderId(), e.productId(), e.quantity(), e.amount()));
    }
}
