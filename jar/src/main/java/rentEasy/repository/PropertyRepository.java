package rentEasy.repository;

import rentEasy.dataBase.Property;
import rentEasy.dataBase.Review;
import jakarta.persistence.EntityManager;

import java.util.Optional;

public class PropertyRepository {

    private final EntityManager entityManager;

    public PropertyRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Optional<Property> findByIdWithDetails(Long propertyId) {
        Property property = entityManager.find(Property.class, propertyId);
        if (property == null) {
            return Optional.empty();
        }

        property.getHost().getId();
        property.getImages().size();
        property.getReviews().size();

        for (Review review : property.getReviews()) {
            review.getUser().getId();
        }

        return Optional.of(property);
    }
}
