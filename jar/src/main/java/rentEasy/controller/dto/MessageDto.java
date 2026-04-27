package rentEasy.controller.dto;

import rentEasy.model.Booking;
import rentEasy.model.Message;
import rentEasy.model.Property;
import rentEasy.model.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

public record MessageDto(
        Long id,
        UserSummary sender,
        UserSummary recipient,
        PropertySummary property,
        BookingSummary booking,
        String content,
        Instant sentAt,
        Boolean read
) {

    public record UserSummary(Long id, String username, String email) {
    }

    public record PropertySummary(Long id, String name, String address, String city, String country) {
    }

    public record BookingSummary(Long id, LocalDate startDate, LocalDate endDate) {
    }

    public static MessageDto fromEntity(Message message) {
        Objects.requireNonNull(message, "message must not be null");
        return new MessageDto(
                message.getId(),
                toUserSummary(message.getSender()),
                toUserSummary(message.getRecipient()),
                toPropertySummary(message.getProperty()),
                toBookingSummary(message.getBooking()),
                message.getContent(),
                message.getSentAt(),
                message.getRead()
        );
    }

    private static UserSummary toUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail());
    }

    private static PropertySummary toPropertySummary(Property property) {
        if (property == null) {
            return null;
        }
        return new PropertySummary(
                property.getId(),
                property.getName(),
                property.getAddress(),
                property.getCity(),
                property.getCountry()
        );
    }

    private static BookingSummary toBookingSummary(Booking booking) {
        if (booking == null) {
            return null;
        }
        return new BookingSummary(booking.getId(), booking.getStartDate(), booking.getEndDate());
    }
}
