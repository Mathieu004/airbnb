package rentEasy.controller.dto;

import rentEasy.model.Property;
import rentEasy.model.PropertyImage;
import rentEasy.model.Review;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public record PropertyDto(
        Long id,
        String propertyType,
        String name,
        String address,
        String city,
        String country,
        BigDecimal pricePerNight,
        Integer maxGuests,
        Integer bedrooms,
        Integer bathrooms,
        String description,
        String includedFeatures,
        HostDetails host,
        List<ImageDetails> images,
        List<ReviewDetails> reviews
) {

    public record HostDetails(String username, String email) {
    }

    public record ImageDetails(String imageUrl, Boolean isMain) {
    }

    public record ReviewDetails(String username, Integer rating, String comment) {
    }

    public static PropertyDto fromEntity(Property property) {
        Objects.requireNonNull(property, "property must not be null");

        return new PropertyDto(
                property.getId(),
                property.getType() == null ? null : property.getType().name().toLowerCase(),
                property.getName(),
                property.getAddress(),
                property.getCity(),
                property.getCountry(),
                property.getPricePerNight(),
                property.getMaxGuestnumber(),
                property.getBedroomNumber(),
                property.getBathroomNumber(),
                property.getDescription(),
                buildIncludedFeatures(property),
                property.getHost() == null ? null : new HostDetails(
                        property.getHost().getUsername(),
                        property.getHost().getEmail()
                ),
                property.getImages() == null ? List.of() : property.getImages().stream()
                        .map(PropertyDto::toImageDetails)
                        .toList(),
                property.getReviewsList() == null ? List.of() : property.getReviewsList().stream()
                        .map(PropertyDto::toReviewDetails)
                        .toList()
        );
    }

    private static ImageDetails toImageDetails(PropertyImage image) {
        return new ImageDetails(image.getImageUrl(), image.getIsMain());
    }

    private static ReviewDetails toReviewDetails(Review review) {
        return new ReviewDetails(
                review.getUser() == null ? null : review.getUser().getUsername(),
                review.getRating(),
                review.getComment()
        );
    }

    private static String buildIncludedFeatures(Property property) {
        List<String> features = new ArrayList<>();

        addFeature(features, property.getHasHairDryer(), "hair dryer");
        addFeature(features, property.getHasWashMachine(), "wash machine");
        addFeature(features, property.getHasDryerMachine(), "dryer machine");
        addFeature(features, property.getHasAirConditioner(), "air conditioner");
        addFeature(features, property.getHasKitchen(), "kitchen");
        addFeature(features, property.getHasHeater(), "heater");
        addFeature(features, property.getHasOven(), "oven");
        addFeature(features, property.getHasCoffeeMachine(), "coffee machine");
        addFeature(features, property.getHasTV(), "tv");
        addFeature(features, property.getHasWifi(), "wifi");
        addFeature(features, property.getHasGarden(), "garden");
        addFeature(features, property.getAreAnimalsAllowed(), "animals allowed");

        return String.join(", ", features);
    }

    private static void addFeature(List<String> features, Boolean enabled, String label) {
        if (Boolean.TRUE.equals(enabled)) {
            features.add(label);
        }
    }
}
