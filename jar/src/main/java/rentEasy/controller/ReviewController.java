package rentEasy.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import rentEasy.model.Review;

import java.util.Map;

public class ReviewController {

    @GetMapping("/api/test")
    public Review load(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @GetMapping("/api/test")
    public Review loadAll(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public Review create(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public Review update(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public Review delete(@RequestBody Map<String, Object> payload) {
        return null;
    }
}
