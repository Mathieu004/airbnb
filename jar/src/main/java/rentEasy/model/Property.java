package rentEasy.model;

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

    @Column(name = "price_per_night")
    private BigDecimal pricePerNight;

    @Column(name = "max_guest_number")
    private Integer maxGuestnumber;

    private Integer bedroomNumber;
    private Integer bathroomNumber;

    @Column(name = "has_hair_dryer")
    private Boolean hasHairDryer;
    
    @Column(name = "has_wash_machine")
    private Boolean hasWashMachine;

    @Column(name = "has_dryer_machine")
    private Boolean hasDryerMachine;

    @Column(name = "has_air_conditioner")
    private Boolean hasAirConditioner;

    @Column(name = "has_kitchen")
    private Boolean hasKitchen;

    @Column(name = "has_heater")
    private Boolean hasHeater;

    @Column(name = "has_oven")
    private Boolean hasOven;

    @Column(name = "created", insertable = false, updatable = false)
    private Timestamp created;

    @Column(name = "has_coffee_machine")
    private Boolean hasCoffeeMachine;

    @Column(name = "has_tv")
    private Boolean hasTV;

    @Column(name = "has_wifi")
    private Boolean hasWifi;

    @Column(name = "has_garden")
    private Boolean hasGarden;

    @Column(name = "are_animals_allowed")
    private Boolean areAnimalsAllowed;

    @Column(name = "cleaning_option_price")
    private Boolean cleaningOptionPrice;

    @Column(name = "type")
    private Boolean Type;

    @Column(name = "size")
    private Boolean Size;

    @Column(name = "is_active")
    private Boolean isActive;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<PropertyImage> images = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<Review> reviewsList = new ArrayList<>();
}
