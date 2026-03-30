package rentEasy.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import rentEasy.model.Property;

import java.util.Map;

public class PropertyController {

    @GetMapping("/api/test")
    public Property load(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @GetMapping("/api/test")
    public Property loadAll(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public Property create(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public Property update(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public Property delete(@RequestBody Map<String, Object> payload) {
        return null;
    }
}
