package com.ecommerce.inventory.dto;
import jakarta.validation.constraints.*;
public record InventoryRequest(@NotNull Long productId,@Min(0) int quantity){}
