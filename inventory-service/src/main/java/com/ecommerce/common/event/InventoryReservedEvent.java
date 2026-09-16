package com.ecommerce.common.event;

public record InventoryReservedEvent(Long orderId, Long productId, int quantity) {}
