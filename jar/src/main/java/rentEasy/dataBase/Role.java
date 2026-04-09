package rentEasy.dataBase;

import java.text.Normalizer;
import java.util.Locale;

public enum Role {
    GUEST,
    HOST,
    ADMIN;

    public static Role fromRequestValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "guest", "client" -> GUEST;
            case "host", "owner", "proprietaire", "proprietary" -> HOST;
            case "admin", "administrator" -> ADMIN;
            default -> throw new IllegalArgumentException("Unsupported role value: " + value);
        };
    }
}
