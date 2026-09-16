package com.ecommerce.common.event;

import java.math.BigDecimal;

public record PaymentCompletedEvent(Long orderId, BigDecimal amount, String status) {}
