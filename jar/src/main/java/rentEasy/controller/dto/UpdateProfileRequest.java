package rentEasy.controller.dto;

public record UpdateProfileRequest(
        String username,
        String email
) {
}
