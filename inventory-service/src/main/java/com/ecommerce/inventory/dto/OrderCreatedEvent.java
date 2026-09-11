package com.ecommerce.inventory.dto;
import java.math.BigDecimal;
public record OrderCreatedEvent(Long orderId,Long userId,Long productId,int quantity,BigDecimal amount){}
