package rentEasy.service;

import java.math.BigDecimal;
import java.util.List;

public record PropertyDetails(
        Long id,
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
}
