package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto create(@Valid @RequestBody Review review) {
        return ReviewDto.fromEntity(reviewService.create(review));
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
