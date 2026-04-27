package rentEasy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"sender", "recipient", "property", "booking"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    @Column(name = "is_read", nullable = false)
    private Boolean read;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = Instant.now();
        }
        if (read == null) {
            read = false;
        }
    }
}
