package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rentEasy.model.Property;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findAllBy();

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    Optional<Property> findOneById(Long id);

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findByHostId(Long hostId);

    @Modifying

    @Query("UPDATE Property p SET p.isActive = :isActive WHERE p.id = :id")
    void updateStatusById(@Param("id") Long id, @Param("isActive") Boolean isActive);

    @EntityGraph(attributePaths = {"host", "images", "reviewsList", "reviewsList.user"})
    List<Property> findAllByIsActiveTrue();
}




