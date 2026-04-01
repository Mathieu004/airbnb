package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.BookingDto;
import rentEasy.model.Booking;
import rentEasy.service.BookingService;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
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

    @GetMapping("/{id}")
    public BookingDto getById(@PathVariable Long id) {
        return toDto(bookingService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDto create(@Valid @RequestBody Booking booking) {
        return toDto(bookingService.create(booking));
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
