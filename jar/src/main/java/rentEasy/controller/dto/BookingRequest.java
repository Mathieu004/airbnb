package rentEasy.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingRequest(
        @NotNull Long propertyId,
        @NotBlank String guestUsername,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull BigDecimal totalPrice,
        Integer numberOfGuests
) {
}
