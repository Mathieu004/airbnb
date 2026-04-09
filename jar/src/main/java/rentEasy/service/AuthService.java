package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import rentEasy.dataBase.Role;
import rentEasy.model.User;
import rentEasy.repository.UserRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    @Value("${app.auth.token-secret}")
    private String tokenSecret;

    @Transactional
    public String login(String username, String password) {
        if (isBlank(username) || isBlank(password)) {
            throw new IllegalArgumentException("Username and password are required.");
        }

        User user = userRepository.findByUsernameIgnoreCase(username.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        if (!passwordService.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials.");
        }

        if (passwordService.needsRehash(user.getPasswordHash())) {
            user.setPasswordHash(passwordService.hash(password));
            userRepository.save(user);
        }

        return generateToken(user);
    }

    private String generateToken(User user) {
        try {
            String header = encodeJson("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            long expiresAt = Instant.now().plusSeconds(60L * 60L * 24L).getEpochSecond();
            String payload = encodeJson(
                    "{\"sub\":\"" + escape(user.getUsername()) + "\","
                            + "\"uid\":" + user.getId() + ","
                            + "\"role\":\"" + user.getRole() + "\","
                            + "\"roles\":[" + formatRoles(user) + "],"
                            + "\"exp\":" + expiresAt + "}"
            );

            String content = header + "." + payload;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String signature = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));

            return content + "." + signature;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to generate token.", exception);
        }
    }

    private String encodeJson(String json) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String formatRoles(User user) {
        return user.getRoles().stream()
                .map(Role::name)
                .map(this::escape)
                .map(role -> "\"" + role + "\"")
                .collect(Collectors.joining(","));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
