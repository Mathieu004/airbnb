package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.BookingDto;
import rentEasy.controller.dto.BookingRequest;
import rentEasy.model.Booking;
import rentEasy.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingDto> getAll() {
        return bookingService.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/guest/{guestId}")
    public List<BookingDto> getAllByGuestId(@PathVariable Long guestId) {
        return bookingService.findAllByGuestId(guestId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public BookingDto getById(@PathVariable Long id) {
        return toDto(bookingService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDto create(@Valid @RequestBody BookingRequest bookingRequest) {
        return toDto(bookingService.create(bookingRequest));
    }

    @PutMapping("/{id}")
    public BookingDto update(@PathVariable Long id, @Valid @RequestBody Booking booking) {
        return toDto(bookingService.update(id, booking));
    }

    @PatchMapping("/{id}/status")
    public BookingDto updateStatus(@PathVariable Long id, @RequestBody Booking booking) {
        return toDto(bookingService.partialUpdateStatus(id, booking));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookingService.delete(id);
    }

    private BookingDto toDto(Booking booking) {
        return BookingDto.fromEntity(booking);
    }
}
