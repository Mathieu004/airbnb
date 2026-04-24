package rentEasy.controller.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import rentEasy.model.Property;

import java.math.BigDecimal;
import java.util.List;

public record PropertyRequest(
        @NotNull
        @Valid
        HostReference host,

        @NotBlank
        String name,

        String address,

        @NotBlank
        String city,

        @NotBlank
        String country,

        String description,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal pricePerNight,

        @NotNull
        @Positive
        Integer maxGuestnumber,

        @NotNull
        @PositiveOrZero
        Integer bedroomNumber,

        @NotNull
        @PositiveOrZero
        Integer bathroomNumber,

        Boolean hasHairDryer,
        Boolean hasWashMachine,
        Boolean hasDryerMachine,
        Boolean hasAirConditioner,
        Boolean hasKitchen,
        Boolean hasHeater,
        Boolean hasOven,
        Boolean hasCoffeeMachine,
        Boolean hasTV,
        Boolean hasWifi,
        Boolean hasGarden,
        Boolean areAnimalsAllowed,

        @PositiveOrZero
        Integer cleaningOptionPrice,

        @NotNull
        Property.PropertyType type,

        @NotNull
        @Positive
        Integer size,

        Boolean isActive,

        @Valid
        List<ImageRequest> images
) {
    public record HostReference(@NotNull Long id) {
    }

    public record ImageRequest(
            @NotBlank String imageUrl,
            Boolean isMain
    ) {
    }
}
