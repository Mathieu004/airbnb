package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rentEasy.model.Property;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Override
    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findAll();

    @Override
    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    Optional<Property> findById(Long id);

    default List<Property> findAllWithRelations() {
        return findAll();
    }

    default Optional<Property> findByIdWithRelations(Long id) {
        return findById(id);
    }
}
