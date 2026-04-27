package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rentEasy.controller.dto.CreateMessageRequest;
import rentEasy.model.Booking;
import rentEasy.model.Message;
import rentEasy.model.Property;
import rentEasy.model.User;
import rentEasy.repository.BookingRepository;
import rentEasy.repository.MessageRepository;
import rentEasy.repository.PropertyRepository;
import rentEasy.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public Message create(CreateMessageRequest request) {
        User sender = userRepository.findById(request.senderId())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        Property property = propertyRepository.findOneById(request.propertyId())
                .orElseThrow(() -> new IllegalArgumentException("Logement introuvable"));
        Booking booking = request.bookingId() == null ? null : bookingRepository.findByIdWithRelations(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Reservation introuvable"));

        User recipient = resolveRecipient(sender, property, booking, request.recipientId());
        if (recipient.getId().equals(sender.getId())) {
            throw new IllegalArgumentException("Impossible de s'envoyer un message a soi-meme");
        }

        Message message = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .property(property)
                .booking(booking)
                .content(request.content().trim())
                .build();

        return messageRepository.save(message);
    }

    @Transactional
    public List<Message> findByUserId(Long userId) {
        return messageRepository.findBySenderIdOrRecipientIdOrderBySentAtDesc(userId, userId);
    }

    @Transactional
    public List<Message> findThread(Long userId, Long propertyId, Long bookingId) {
        return messageRepository.findThread(userId, propertyId, bookingId);
    }

    private User resolveRecipient(User sender, Property property, Booking booking, Long requestedRecipientId) {
        if (requestedRecipientId != null) {
            return userRepository.findById(requestedRecipientId)
                    .orElseThrow(() -> new IllegalArgumentException("Destinataire introuvable"));
        }

        User host = property.getHost();
        if (host == null) {
            throw new IllegalArgumentException("Ce logement n'a pas d'hote");
        }

        if (host.getId().equals(sender.getId())) {
            if (booking == null || booking.getGuest() == null) {
                throw new IllegalArgumentException("Une reservation est necessaire pour contacter le client");
            }
            return booking.getGuest();
        }

        return host;
    }
}
