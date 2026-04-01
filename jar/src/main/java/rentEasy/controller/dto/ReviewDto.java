package rentEasy.controller.dto;

import rentEasy.model.Property;
import rentEasy.model.Review;
import rentEasy.model.User;

import java.sql.Timestamp;
import java.util.Objects;

public record ReviewDto(
        Long id,
        Integer rating,
        String comment,
        Timestamp createdAt,
        PropertySummary property,
        ReviewerSummary reviewer
) {

    public record PropertySummary(Long id, String name, String city, String country) {
    }

    public record ReviewerSummary(Long id, String username, String email) {
    }

    public static ReviewDto fromEntity(Review review) {
        Objects.requireNonNull(review, "review must not be null");
        return new ReviewDto(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                toPropertySummary(review.getProperty()),
                toReviewerSummary(review.getUser())
        );
    }

    private static PropertySummary toPropertySummary(Property property) {
        if (property == null) {
            return null;
        }
        return new PropertySummary(
                property.getId(),
                property.getName(),
                property.getCity(),
                property.getCountry()
        );
    }

    private static ReviewerSummary toReviewerSummary(User user) {
        if (user == null) {
            return null;
        }
        return new ReviewerSummary(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
