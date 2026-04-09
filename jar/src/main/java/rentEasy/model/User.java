package rentEasy.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import rentEasy.dataBase.Role;
import rentEasy.dataBase.RoleConverter;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"hostedProperties", "reviews"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(unique = true, length = 255)
    private String email;

    @JsonAlias("password")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @JsonIgnore
    @Convert(converter = RoleConverter.class)
    @Column(name = "role", length = 20)
    private Role legacyRole;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<Role> roles = new LinkedHashSet<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    @OneToMany(mappedBy = "host")
    private List<Property> hostedProperties = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Review> reviews = new ArrayList<>();

    @PostLoad
    @PrePersist
    @PreUpdate
    private void synchronizeRoles() {
        if (roles == null) {
            roles = new LinkedHashSet<>();
        }

        if (roles.isEmpty() && legacyRole != null) {
            roles.add(legacyRole);
        }

        if (legacyRole == null && !roles.isEmpty()) {
            legacyRole = determinePrimaryRole(roles);
        }
    }

    @JsonProperty("role")
    public Role getRole() {
        synchronizeRoles();
        return determinePrimaryRole(roles);
    }

    @JsonProperty("role")
    public void setRole(Role role) {
        if (roles == null) {
            roles = new LinkedHashSet<>();
        }
        if (role != null) {
            roles.add(role);
        }
        legacyRole = role;
    }

    @JsonProperty("roles")
    public Set<Role> getRoles() {
        synchronizeRoles();
        return new LinkedHashSet<>(roles);
    }

    @JsonProperty("roles")
    public void setRoles(Set<Role> roles) {
        this.roles = new LinkedHashSet<>();
        if (roles != null) {
            this.roles.addAll(roles);
        }
        this.legacyRole = this.roles.isEmpty() ? null : determinePrimaryRole(this.roles);
    }

    public boolean hasRole(Role role) {
        return role != null && getRoles().contains(role);
    }

    private Role determinePrimaryRole(Set<Role> currentRoles) {
        if (currentRoles == null || currentRoles.isEmpty()) {
            return legacyRole;
        }
        if (currentRoles.contains(Role.ADMIN)) {
            return Role.ADMIN;
        }
        if (currentRoles.contains(Role.GUEST)) {
            return Role.GUEST;
        }
        if (currentRoles.contains(Role.HOST)) {
            return Role.HOST;
        }
        return legacyRole;
    }
}
