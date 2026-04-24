package rentEasy.controller.dto;

import rentEasy.model.Booking;
import rentEasy.model.BookingStatus;
import rentEasy.model.Property;
import rentEasy.model.User;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.Objects;

public record BookingDto(
        Long id,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalPrice,
        Timestamp reservationDate,
        BookingStatus status,
        Integer numberOfGuests,
        String status,
        PropertySummary property,
        GuestSummary guest
) {

    public record PropertySummary(Long id, String name, String city, String country) {
    }

    public record GuestSummary(Long id, String username, String email) {
    }

    public static BookingDto fromEntity(Booking booking) {
        Objects.requireNonNull(booking, "booking must not be null");
        return new BookingDto(
                booking.getId(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTotalPrice(),
                booking.getReservationDate(),
                booking.getStatus(),
                booking.getNumberOfGuests(),
                booking.getStatus(),
                toPropertySummary(booking.getProperty()),
                toGuestSummary(booking.getGuest())
        );
    }

    private static PropertySummary toPropertySummary(Property property) {
        if (property == null) {
            return null;
        }
        return new PropertySummary(
                property.getId(),
                property.getName(),
                property.getCity(),
                property.getCountry()
        );
    }

    private static GuestSummary toGuestSummary(User guest) {
        if (guest == null) {
            return null;
        }
        return new GuestSummary(
                guest.getId(),
                guest.getUsername(),
                guest.getEmail()
        );
    }
}
