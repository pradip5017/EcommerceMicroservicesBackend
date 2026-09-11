package com.ecommerce.order.dto;
import java.math.BigDecimal;
public record PaymentCompletedEvent(Long orderId,BigDecimal amount,String status){}
