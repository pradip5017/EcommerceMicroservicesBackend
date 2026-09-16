package com.ecommerce.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        @Min(value = 0, message = "Quantity cannot be negative")
        int quantity
) {
}
