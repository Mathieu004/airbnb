package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rentEasy.controller.dto.BookingRequest;
import rentEasy.model.Booking;
import rentEasy.model.Property;
import rentEasy.model.User;
import rentEasy.repository.BookingRepository;
import rentEasy.repository.PropertyRepository;
import rentEasy.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Transactional
    public Booking create(BookingRequest request) {
        Property property = propertyRepository.findById(request.propertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + request.propertyId()));
        User guest = userRepository.findByUsernameIgnoreCase(request.guestUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.guestUsername()));

        Booking booking = Booking.builder()
                .property(property)
                .guest(guest)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .totalPrice(request.totalPrice())
                .status("confirmed")
                .build();

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking update(Long bookingId, Booking booking) {
        Booking existing = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        existing.setStartDate(booking.getStartDate());
        existing.setEndDate(booking.getEndDate());
        existing.setTotalPrice(booking.getTotalPrice());
        if (booking.getProperty() != null && booking.getProperty().getId() != null) {
            existing.setProperty(propertyRepository.getReferenceById(booking.getProperty().getId()));
        }
        if (booking.getGuest() != null) {
            if (booking.getGuest().getId() != null) {
                existing.setGuest(userRepository.getReferenceById(booking.getGuest().getId()));
            } else if (booking.getGuest().getUsername() != null) {
                existing.setGuest(userRepository.findByUsernameIgnoreCase(booking.getGuest().getUsername())
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + booking.getGuest().getUsername())));
            }
        }
        return bookingRepository.save(existing);
    }

    @Transactional
    public void delete(Long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new IllegalArgumentException("Booking not found: " + bookingId);
        }
        bookingRepository.deleteById(bookingId);
    }

    @Transactional
    public Booking partialUpdateStatus(Long bookingId, Booking updated) {
        Booking existing = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (updated.getStatus() != null && !updated.getStatus().isBlank()) {
            existing.setStatus(updated.getStatus());
        }

        return bookingRepository.save(existing);
    }

    @Transactional
    public List<Booking> findAll() {
        return bookingRepository.findAllWithRelations();
    }

    @Transactional
    public List<Booking> findAllByGuestId(Long guestId) {
        return bookingRepository.findAllByGuestIdWithRelations(guestId);
    }

    @Transactional
    public Booking findById(Long bookingId) {
        return bookingRepository.findByIdWithRelations(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
    }
}
