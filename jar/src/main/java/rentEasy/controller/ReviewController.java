package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.CreateReviewRequest;
import rentEasy.controller.dto.ReviewDto;
import rentEasy.model.Review;
import rentEasy.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public List<ReviewDto> getAll() {
        return reviewService.findAll()
                .stream()
                .map(ReviewDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ReviewDto getById(@PathVariable Long id) {
        return ReviewDto.fromEntity(reviewService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public List<ReviewDto> getByUserId(@PathVariable Long userId) {
        return reviewService.findByUserId(userId)
                .stream()
                .map(ReviewDto::fromEntity)
                .toList();
    }

    @GetMapping("/property/{propertyId}")
    public List<ReviewDto> getByPropertyId(@PathVariable Long propertyId) {
        return reviewService.findByPropertyId(propertyId)
                .stream()
                .map(ReviewDto::fromEntity)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto create(@Valid @RequestBody CreateReviewRequest request) {
        Review review = reviewService.createFromRequest(
                request.userId(),
                request.propertyId(),
                request.rating(),
                request.comment()
        );
        return ReviewDto.fromEntity(review);
    }

    @PutMapping("/{id}")
    public ReviewDto update(@PathVariable Long id, @Valid @RequestBody Review review) {
        return ReviewDto.fromEntity(reviewService.update(id, review));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        reviewService.delete(id);
    }
}
