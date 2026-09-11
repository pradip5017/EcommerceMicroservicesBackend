package com.ecommerce.inventory.dto;
public record InventoryReservedEvent(Long orderId,Long productId,int quantity){}
