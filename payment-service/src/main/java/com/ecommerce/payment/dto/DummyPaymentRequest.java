package com.ecommerce.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record DummyPaymentRequest(
        @NotNull Long orderId,
        @NotNull @Positive BigDecimal amount,
        String paymentMethod,
        String cardNumber,
        String status
) {
}
