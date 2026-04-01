package rentEasy.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class PasswordService {

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;

    private final SecureRandom secureRandom = new SecureRandom();
    private final String passwordPepper;

    public PasswordService(@Value("${app.security.password-pepper}") String passwordPepper) {
        this.passwordPepper = passwordPepper;
    }

    public String hash(String rawPassword) {
        try {
            byte[] salt = new byte[SALT_LENGTH];
            secureRandom.nextBytes(salt);

            byte[] derivedKey = deriveKey(rawPassword, salt);
            return "pbkdf2$" + ITERATIONS + "$"
                    + Base64.getEncoder().encodeToString(salt) + "$"
                    + Base64.getEncoder().encodeToString(derivedKey);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash password.", exception);
        }
    }

    public boolean matches(String rawPassword, String storedValue) {
        if (rawPassword == null || storedValue == null || storedValue.isBlank()) {
            return false;
        }

        if (!storedValue.startsWith("pbkdf2$")) {
            return storedValue.equals(rawPassword);
        }

        try {
            String[] parts = storedValue.split("\\$");
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] expected = Base64.getDecoder().decode(parts[3]);

            PBEKeySpec spec = new PBEKeySpec(
                    (rawPassword + passwordPepper).toCharArray(),
                    salt,
                    iterations,
                    expected.length * 8
            );
            byte[] actual = SecretKeyFactory.getInstance(ALGORITHM).generateSecret(spec).getEncoded();
            return constantTimeEquals(expected, actual);
        } catch (Exception exception) {
            return false;
        }
    }

    public boolean needsRehash(String storedValue) {
        return storedValue == null || !storedValue.startsWith("pbkdf2$");
    }

    private byte[] deriveKey(String rawPassword, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(
                (rawPassword + passwordPepper).toCharArray(),
                salt,
                ITERATIONS,
                KEY_LENGTH
        );
        return SecretKeyFactory.getInstance(ALGORITHM).generateSecret(spec).getEncoded();
    }

    private boolean constantTimeEquals(byte[] left, byte[] right) {
        if (left.length != right.length) {
            return false;
        }

        int result = 0;
        for (int index = 0; index < left.length; index++) {
            result |= left[index] ^ right[index];
        }
        return result == 0;
    }
}
