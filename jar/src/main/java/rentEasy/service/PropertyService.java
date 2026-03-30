package rentEasy.service;

import rentEasy.model.Property;
import rentEasy.model.PropertyImage;
import rentEasy.model.Review;
import rentEasy.repository.PropertyRepository;

import java.util.List;

public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public PropertyDetails getPropertyDetails(Long propertyId) {
        Property property = propertyRepository.findByIdWithDetails(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));

        List<PropertyDetails.ImageDetails> images = property.getImages().stream()
                .map(this::toImageDetails)
                .toList();

        List<PropertyDetails.ReviewDetails> reviews = property.getReviews().stream()
                .map(this::toReviewDetails)
                .toList();

        return new PropertyDetails(
                property.getId(),
                property.getName(),
                property.getAddress(),
                property.getCity(),
                property.getCountry(),
                property.getPricePerNight(),
                property.getMaxGuests(),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getDescription(),
                property.getIncludedFeatures(),
                new PropertyDetails.HostDetails(
                        property.getHost().getUsername(),
                        property.getHost().getEmail()
                ),
                images,
                reviews
        );
    }

    private PropertyDetails.ImageDetails toImageDetails(PropertyImage image) {
        return new PropertyDetails.ImageDetails(image.getImageUrl(), image.getIsMain());
    }

    private PropertyDetails.ReviewDetails toReviewDetails(Review review) {
        return new PropertyDetails.ReviewDetails(
                review.getUser().getUsername(),
                review.getRating(),
                review.getComment()
        );
    }
}
