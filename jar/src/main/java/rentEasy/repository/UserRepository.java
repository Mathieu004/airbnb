package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rentEasy.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Override
    @EntityGraph(attributePaths = {"hostedProperties", "reviews"})
    List<User> findAll();

    @Override
    @EntityGraph(attributePaths = {"hostedProperties", "reviews"})
    Optional<User> findById(Long id);

    default List<User> findAllWithRelations() {
        return findAll();
    }

    default Optional<User> findByIdWithRelations(Long id) {
        return findById(id);
    }

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);
}
