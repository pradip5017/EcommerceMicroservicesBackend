package com.ecommerce.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DummyPaymentResponse(
        String transactionId,
        Long orderId,
        BigDecimal amount,
        String paymentMethod,
        String status,
        String message,
        LocalDateTime timestamp
) {}
