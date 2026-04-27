package rentEasy.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMessageRequest(
        @NotNull Long senderId,
        Long recipientId,
        @NotNull Long propertyId,
        Long bookingId,
        @NotBlank String content
) {
}
