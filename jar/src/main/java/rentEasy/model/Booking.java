package rentEasy.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;

import rentEasy.model.BookingStatus;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"property", "guest"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private User guest; 

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate; 

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate; 

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "reservation_date")
    private Timestamp reservationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "num_guests")
    private Integer numberOfGuests;

    @Column(name = "status", nullable = false)
    private String status;

    @PrePersist
    protected void onCreate() {
        if (reservationDate == null) {
            reservationDate = Timestamp.from(Instant.now());
        }
        if (status == null || status.isBlank()) {
            status = "confirmed";
        }
    }
}
