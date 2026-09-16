package com.ecommerce.inventory.controller;

import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import com.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService service;
    private final InventoryRepository repo;

    public InventoryController(InventoryService service, InventoryRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping
    public Inventory create(@Valid @RequestBody InventoryRequest request) {
        return service.create(request);
    }

    @GetMapping("/{productId}")
    public Inventory get(@PathVariable Long productId) {
        return repo.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
    }
}
