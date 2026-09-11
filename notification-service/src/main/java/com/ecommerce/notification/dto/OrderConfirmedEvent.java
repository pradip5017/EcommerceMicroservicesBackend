package com.ecommerce.notification.dto;
import java.math.BigDecimal;
public record OrderConfirmedEvent(Long orderId,BigDecimal amount,String status){}
