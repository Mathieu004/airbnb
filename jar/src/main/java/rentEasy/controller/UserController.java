package rentEasy.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import rentEasy.model.User;

import java.util.Map;

public class UserController {

    @GetMapping("/api/test")
    public User load(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @GetMapping("/api/test")
    public User loadAll(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public User create(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public User update(@RequestBody Map<String, Object> payload) {
        return null;
    }

    @PostMapping("/api/test")
    public User delete(@RequestBody Map<String, Object> payload) {
        return null;
    }

}
