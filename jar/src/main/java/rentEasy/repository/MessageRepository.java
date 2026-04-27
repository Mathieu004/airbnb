package rentEasy.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rentEasy.model.Message;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @EntityGraph(attributePaths = {"sender", "recipient", "property", "property.host", "booking", "booking.guest"})
    List<Message> findBySenderIdOrRecipientIdOrderBySentAtDesc(Long senderId, Long recipientId);

    @EntityGraph(attributePaths = {"sender", "recipient", "property", "property.host", "booking", "booking.guest"})
    @Query("""
            select m from Message m
            where (m.sender.id = :userId or m.recipient.id = :userId)
              and m.property.id = :propertyId
              and (
                (:bookingId is null and m.booking is null)
                or (:bookingId is not null and m.booking.id = :bookingId)
              )
            order by m.sentAt asc
            """)
    List<Message> findThread(
            @Param("userId") Long userId,
            @Param("propertyId") Long propertyId,
            @Param("bookingId") Long bookingId
    );
}
