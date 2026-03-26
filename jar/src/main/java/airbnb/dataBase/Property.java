package airbnb.dataBase;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"host", "images", "reviews"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String country;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "included_features", columnDefinition = "text")
    private String includedFeatures;

    @Column(name = "price_per_night")
    private BigDecimal pricePerNight;

    @Column(name = "max_guests")
    private Integer maxGuests;

    private Integer bedrooms;
    private Integer bathrooms;

    @Column(name = "has_wifi")
    private Boolean hasWifi;

    @Column(name = "has_parking")
    private Boolean hasParking;

    @Column(name = "has_air_conditioning")
    private Boolean hasAirConditioning;

    @Column(name = "has_kitchen")
    private Boolean hasKitchen;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<PropertyImage> images = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<Review> reviews = new ArrayList<>();
}
