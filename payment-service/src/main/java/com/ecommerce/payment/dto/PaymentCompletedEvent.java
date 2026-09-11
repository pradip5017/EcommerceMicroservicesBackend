package com.ecommerce.payment.dto;
import java.math.BigDecimal;
public record PaymentCompletedEvent(Long orderId,BigDecimal amount,String status){}
