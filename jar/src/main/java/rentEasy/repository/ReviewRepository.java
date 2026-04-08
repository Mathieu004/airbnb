package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rentEasy.model.Review;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"property", "user"})
    List<Review> findAll();

    @EntityGraph(attributePaths = {"property", "user"})
    Optional<Review> findById(Long id);

    @EntityGraph(attributePaths = {"property", "user"})
    List<Review> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"property", "user"})
    List<Review> findByPropertyId(Long propertyId);

    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

    default List<Review> findAllWithRelations() {
        return findAll();
    }

    default Optional<Review> findByIdWithRelations(Long id) {
        return findById(id);
    }
}
