package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rentEasy.model.Booking;
import rentEasy.repository.BookingRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    @Transactional
    public Booking create(Booking booking) {
        booking.setId(null);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking update(Long bookingId, Booking booking) {
        Booking existing = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        existing.setCheckIn(booking.getCheckIn());
        existing.setCheckOut(booking.getCheckOut());
        existing.setTotalPrice(booking.getTotalPrice());
        existing.setStatus(booking.getStatus());
        existing.setProperty(booking.getProperty());
        existing.setGuest(booking.getGuest());
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
        existing.setStatus(updated.getStatus());
        return bookingRepository.save(existing);
    }

    @Transactional
    public List<Booking> findAll() {
        return bookingRepository.findAllWithRelations();
    }

    @Transactional
    public Booking findById(Long bookingId) {
        return bookingRepository.findByIdWithRelations(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
    }
}
