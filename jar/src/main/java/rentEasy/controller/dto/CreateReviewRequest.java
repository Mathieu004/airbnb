package rentEasy.controller.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateReviewRequest(
        @NotNull Long propertyId,
        @NotNull Long userId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank String comment
) {
}
