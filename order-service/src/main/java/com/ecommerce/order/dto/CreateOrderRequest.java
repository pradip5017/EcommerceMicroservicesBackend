package com.ecommerce.order.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record CreateOrderRequest(
 @NotNull Long userId,
 @NotNull Long productId,
 @Min(1) int quantity,
 @NotNull @Positive BigDecimal amount
){}
