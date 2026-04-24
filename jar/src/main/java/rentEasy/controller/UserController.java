package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.ChangePasswordRequest;
import rentEasy.controller.dto.UpdateProfileRequest;
import rentEasy.model.User;
import rentEasy.service.PasswordService;
import rentEasy.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/users", "/api/user"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordService passwordService;

    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@Valid @RequestBody User user) {
        return userService.create(user);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @Valid @RequestBody User user) {
        return userService.update(id, user);
    }

    @PatchMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        try {
            User existing = userService.findById(id);
            if (request.username() != null && !request.username().isBlank()) {
                existing.setUsername(request.username().trim());
            }
            if (request.email() != null && !request.email().isBlank()) {
                existing.setEmail(request.email().trim());
            }
            userService.updateProfile(existing);
            return ResponseEntity.ok(existing);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            User existing = userService.findById(id);
            if (!passwordService.matches(request.currentPassword(), existing.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mot de passe actuel incorrect"));
            }
            if (request.newPassword() == null || request.newPassword().trim().length() < 4) {
                return ResponseEntity.badRequest().body(Map.of("message", "Le nouveau mot de passe doit contenir au moins 4 caractères"));
            }
            existing.setPasswordHash(passwordService.hash(request.newPassword().trim()));
            userService.saveDirectly(existing);
            return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
