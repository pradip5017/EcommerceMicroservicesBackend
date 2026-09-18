package com.ecommerce.common.event;

import java.math.BigDecimal;

/** Must have the same JSON shape as the event emitted by order-service. */
public record OrderConfirmedEvent(Long orderId, Long userId, BigDecimal amount, String status) {}
