package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rentEasy.model.User;
import rentEasy.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        user.setId(null);
        return userRepository.save(user);
    }

    @Transactional
    public User update(Long userId, User user) {
        User existing = findById(userId);
        existing.setUsername(user.getUsername());
        existing.setEmail(user.getEmail());
        existing.setPasswordHash(user.getPasswordHash());
        existing.setRole(user.getRole());
        return userRepository.save(existing);
    }

    @Transactional
    public void delete(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        userRepository.deleteById(userId);
    }
}
