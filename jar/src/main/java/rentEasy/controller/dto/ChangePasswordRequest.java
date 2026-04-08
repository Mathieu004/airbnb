package rentEasy.controller.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}
