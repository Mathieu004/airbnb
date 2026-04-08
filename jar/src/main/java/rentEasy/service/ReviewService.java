package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rentEasy.model.Property;
import rentEasy.model.Review;
import rentEasy.model.User;
import rentEasy.repository.PropertyRepository;
import rentEasy.repository.ReviewRepository;
import rentEasy.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Transactional
    public Review create(Review review) {
        review.setId(null);
        return reviewRepository.save(review);
    }

    @Transactional
    public Review createFromRequest(Long userId, Long propertyId, Integer rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("La note doit être entre 1 et 5");
        }
        if (reviewRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            throw new IllegalArgumentException("Vous avez déjà laissé un avis pour ce logement");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Logement non trouvé"));
        Review review = Review.builder()
                .user(user)
                .property(property)
                .rating(rating)
                .comment(comment)
                .build();
        return reviewRepository.save(review);
    }

    @Transactional
    public List<Review> findByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    @Transactional
    public List<Review> findByPropertyId(Long propertyId) {
        return reviewRepository.findByPropertyId(propertyId);
    }

    @Transactional
    public Review update(Long reviewId, Review review) {
        Review existing = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));
        existing.setRating(review.getRating());
        existing.setComment(review.getComment());
        existing.setProperty(review.getProperty());
        existing.setUser(review.getUser());
        return reviewRepository.save(existing);
    }

    @Transactional
    public void delete(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new IllegalArgumentException("Review not found: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    @Transactional
    public List<Review> findAll() {
        return reviewRepository.findAllWithRelations();
    }

    @Transactional
    public Review findById(Long reviewId) {
        return reviewRepository.findByIdWithRelations(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));
    }
}
