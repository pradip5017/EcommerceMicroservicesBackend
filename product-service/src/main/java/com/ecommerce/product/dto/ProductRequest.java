package com.ecommerce.product.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record ProductRequest(
 @NotBlank String name,
 String description,
 @NotNull @Positive BigDecimal price,
 String category,
 String imageUrl
) {}
