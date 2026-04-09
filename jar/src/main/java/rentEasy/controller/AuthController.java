package rentEasy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rentEasy.repository.UserRepository;
import rentEasy.service.AuthService;
import rentEasy.model.User;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        String token = authService.login(request.username(), request.password());
        User user = userRepository.findByUsernameIgnoreCase(request.username().trim()).orElseThrow();
        return new LoginResponse(token, user.getId(), user.getRole().name());
    }

    public record LoginRequest(String username, String password) {
    }

    public record LoginResponse(String token, Long id, String role) {
    }
}
