package com.ecommerce.common.event;

import java.math.BigDecimal;

public record InventoryReservedEvent(
        Long orderId,
        Long productId,
        int quantity,
        BigDecimal amount
) {}
