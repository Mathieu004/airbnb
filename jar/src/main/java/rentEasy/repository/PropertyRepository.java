package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rentEasy.model.Property;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findAllBy();

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findAllByIsActiveTrue();

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    Optional<Property> findOneById(Long id);

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findByHostId(Long hostId);
}
