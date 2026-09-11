package com.ecommerce.payment.dto;
public record InventoryReservedEvent(Long orderId,Long productId,int quantity){}
