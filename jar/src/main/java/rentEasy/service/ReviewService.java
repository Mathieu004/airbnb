package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rentEasy.model.Review;
import rentEasy.repository.ReviewRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional
    public Review create(Review review) {
        review.setId(null);
        return reviewRepository.save(review);
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
