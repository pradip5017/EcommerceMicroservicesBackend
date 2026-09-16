package com.ecommerce.common.event;

import java.math.BigDecimal;

public record OrderCreatedEvent(Long orderId, Long userId, Long productId, int quantity, BigDecimal amount) {}
