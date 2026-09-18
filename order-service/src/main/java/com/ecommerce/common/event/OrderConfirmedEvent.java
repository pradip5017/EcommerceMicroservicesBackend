package com.ecommerce.common.event;

import java.math.BigDecimal;

/** Event emitted only after payment has completed successfully. */
public record OrderConfirmedEvent(Long orderId, Long userId, BigDecimal amount, String status) {}
