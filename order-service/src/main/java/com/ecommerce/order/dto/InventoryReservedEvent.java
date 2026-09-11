package com.ecommerce.order.dto;
public record InventoryReservedEvent(Long orderId,Long productId,int quantity){}
