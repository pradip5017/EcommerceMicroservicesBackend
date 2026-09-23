package com.ecommerce.order.controller;

import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;
    private final OrderRepository repo;


    public OrderController(OrderService service, OrderRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping
    public Order create(@Valid @RequestBody CreateOrderRequest r) {
        return service.create(r);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public List<Order> all() {
        return repo.findAll();
    }

    @PutMapping("/{id}")
    public Order update(@PathVariable Long id, @Valid @RequestBody CreateOrderRequest r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
