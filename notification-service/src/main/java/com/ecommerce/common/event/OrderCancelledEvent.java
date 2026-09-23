package com.ecommerce.common.event;

import java.math.BigDecimal;

public record OrderCancelledEvent(
        Long orderId,
        Long userId,
        BigDecimal amount,
        String reason
) {}
