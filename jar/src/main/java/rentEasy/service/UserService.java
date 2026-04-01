package rentEasy.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import rentEasy.dataBase.Role;
import rentEasy.model.User;
import rentEasy.repository.UserRepository;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EntityManager entityManager;

    @Transactional
    public List<User> findAll() {
        return userRepository.findAllWithRelations();
    }

    @Transactional
    public User findById(Long userId) {
        return userRepository.findByIdWithRelations(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    @Transactional
    public User create(User user) {
        validateForCreate(user);
        user.setId(null);
        user.setUsername(normalize(user.getUsername()));
        user.setEmail(normalize(user.getEmail()));
        user.setPasswordHash(user.getPasswordHash().trim());
        if (user.getRole() == null) {
            user.setRole(Role.GUEST);
        }

        synchronizeUserIdSequence();

        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            synchronizeUserIdSequence();
            return userRepository.saveAndFlush(user);
        }
    }

    @Transactional
    public User update(Long userId, User user) {
        User existing = findById(userId);
        validateForUpdate(userId, user);

        existing.setUsername(normalize(user.getUsername()));
        existing.setEmail(normalize(user.getEmail()));
        existing.setPasswordHash(user.getPasswordHash().trim());
        existing.setRole(user.getRole() != null ? user.getRole() : existing.getRole());
        return userRepository.save(existing);
    }

    @Transactional
    public void delete(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        userRepository.deleteById(userId);
    }

    private void validateForCreate(User user) {
        validateRequiredFields(user);

        if (userRepository.existsByUsernameIgnoreCase(normalize(user.getUsername()))) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }

        if (userRepository.existsByEmailIgnoreCase(normalize(user.getEmail()))) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
    }

    private void validateForUpdate(Long userId, User user) {
        validateRequiredFields(user);

        userRepository.findByUsernameIgnoreCase(normalize(user.getUsername()))
                .filter(existing -> !Objects.equals(existing.getId(), userId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Username already exists: " + user.getUsername());
                });

        userRepository.findByEmailIgnoreCase(normalize(user.getEmail()))
                .filter(existing -> !Objects.equals(existing.getId(), userId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email already exists: " + user.getEmail());
                });
    }

    private void validateRequiredFields(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User payload is required.");
        }
        if (isBlank(user.getUsername())) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (isBlank(user.getEmail())) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (!user.getEmail().contains("@")) {
            throw new IllegalArgumentException("Email format is invalid.");
        }
        if (isBlank(user.getPasswordHash())) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (user.getPasswordHash().trim().length() < 4) {
            throw new IllegalArgumentException("Password must contain at least 4 characters.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private void synchronizeUserIdSequence() {
        entityManager.createNativeQuery("""
                select setval(
                    pg_get_serial_sequence('users', 'id'),
                    coalesce((select max(id) from users), 0) + 1,
                    false
                )
                """)
                .getSingleResult();
    }
}
