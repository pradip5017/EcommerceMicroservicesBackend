package com.ecommerce.common.event;

import java.math.BigDecimal;

public record OrderConfirmedEvent(Long orderId, BigDecimal amount, String status) {}
