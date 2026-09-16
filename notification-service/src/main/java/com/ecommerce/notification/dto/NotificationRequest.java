package com.ecommerce.notification.dto;

import jakarta.validation.constraints.NotBlank;

public record NotificationRequest(
        Long orderId,
        @NotBlank String message,
        @NotBlank String status
) {}
