package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rentEasy.model.Booking;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"property", "guest"})
    List<Booking> findAll();

    @EntityGraph(attributePaths = {"property", "guest"})
    Optional<Booking> findById(Long id);

    @EntityGraph(attributePaths = {"property", "guest"})
    List<Booking> findByGuestId(Long guestId);

    default List<Booking> findAllWithRelations() {
        return findAll();
    }

    default Optional<Booking> findByIdWithRelations(Long id) {
        return findById(id);
    }

    default List<Booking> findAllByGuestIdWithRelations(Long guestId) {
        return findByGuestId(guestId);
    }
}
