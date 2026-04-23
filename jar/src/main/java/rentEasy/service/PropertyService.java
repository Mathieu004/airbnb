package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rentEasy.dataBase.Role;
import rentEasy.model.Property;
import rentEasy.model.User;
import rentEasy.repository.PropertyRepository;
import rentEasy.repository.UserRepository;

import java.text.Normalizer;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<Property> findAll(Long userId, String requestedRoleValue) {
        if (userId == null) {
            return propertyRepository.findAllBy();
        }

        User user = userRepository.findByIdWithRelations(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + userId));

        if (user.getRole() == Role.ADMIN) {
            return propertyRepository.findAllBy();
        }

        PropertyAccessMode requestedRole = resolveRequestedRole(requestedRoleValue);
        return switch (requestedRole) {
            case GUEST -> propertyRepository.findAllBy();
            case HOST -> propertyRepository.findByHostId(user.getId());
            case ADMIN -> propertyRepository.findAllBy();
        };
    }

    @Transactional
    public Property findById(Long propertyId) {
        return propertyRepository.findOneById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));
    }

    @Transactional
    public Property create(Property property) {
        property.setId(null);
        preparePropertyRelations(property);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property update(Long propertyId, Property property) {
        Property existing = findById(propertyId);

        existing.setName(property.getName());
        existing.setAddress(property.getAddress());
        existing.setCity(property.getCity());
        existing.setCountry(property.getCountry());
        existing.setDescription(property.getDescription());
        existing.setPricePerNight(property.getPricePerNight());
        existing.setMaxGuestnumber(property.getMaxGuestnumber());
        existing.setBedroomNumber(property.getBedroomNumber());
        existing.setBathroomNumber(property.getBathroomNumber());
        existing.setHasHairDryer(property.getHasHairDryer());
        existing.setHasWashMachine(property.getHasWashMachine());
        existing.setHasDryerMachine(property.getHasDryerMachine());
        existing.setHasAirConditioner(property.getHasAirConditioner());
        existing.setHasKitchen(property.getHasKitchen());
        existing.setHasHeater(property.getHasHeater());
        existing.setHasOven(property.getHasOven());
        existing.setHasCoffeeMachine(property.getHasCoffeeMachine());
        existing.setHasTV(property.getHasTV());
        existing.setHasWifi(property.getHasWifi());
        existing.setHasGarden(property.getHasGarden());
        existing.setAreAnimalsAllowed(property.getAreAnimalsAllowed());
        existing.setCleaningOptionPrice(property.getCleaningOptionPrice());
        existing.setType(property.getType());
        existing.setSize(property.getSize());
        existing.setIsActive(property.getIsActive());

        if (property.getHost() != null && property.getHost().getId() != null) {
            existing.setHost(getUserReference(property.getHost().getId()));
        }

        Set<rentEasy.model.PropertyImage> images = new LinkedHashSet<>();
        if (property.getImages() != null) {
            property.getImages().forEach(image -> {
                image.setId(null);
                image.setProperty(existing);
                images.add(image);
            });
        }
        existing.getImages().clear();
        existing.getImages().addAll(images);

        if (property.getReviewsList() != null) {
            existing.getReviewsList().clear();
            property.getReviewsList().forEach(review -> {
                review.setId(null);
                review.setProperty(existing);
                if (review.getUser() != null && review.getUser().getId() != null) {
                    review.setUser(getUserReference(review.getUser().getId()));
                }
                existing.getReviewsList().add(review);
            });
        }

        return propertyRepository.save(existing);
    }

    @Transactional
    public Property updateStatus(Long propertyId, Boolean isActive) {
        if (isActive == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property status is required");
        }

        Property existing = findById(propertyId);
        existing.setIsActive(isActive);
        return propertyRepository.save(existing);
    }

    @Transactional
    public void delete(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException("Property not found: " + propertyId);
        }
        propertyRepository.deleteById(propertyId);
    }

    private void preparePropertyRelations(Property property) {
        if (property.getHost() != null && property.getHost().getId() != null) {
            property.setHost(getUserReference(property.getHost().getId()));
        }

        if (property.getImages() != null) {
            property.getImages().forEach(image -> {
                image.setId(null);
                image.setProperty(property);
            });
        }

        if (property.getReviewsList() != null) {
            property.getReviewsList().forEach(review -> {
                review.setId(null);
                review.setProperty(property);
                if (review.getUser() != null && review.getUser().getId() != null) {
                    review.setUser(getUserReference(review.getUser().getId()));
                }
            });
        }
    }

    private User getUserReference(Long userId) {
        return userRepository.getReferenceById(userId);
    }

    private PropertyAccessMode resolveRequestedRole(String requestedRoleValue) {
        try {
            return PropertyAccessMode.fromRequestValue(requestedRoleValue);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }

    private enum PropertyAccessMode {
        GUEST,
        HOST,
        ADMIN;

        private static PropertyAccessMode fromRequestValue(String value) {
            if (value == null || value.isBlank()) {
                return GUEST;
            }

            String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "")
                    .trim()
                    .toLowerCase(Locale.ROOT);

            return switch (normalized) {
                case "guest", "client" -> GUEST;
                case "host", "owner", "proprietaire", "proprietary" -> HOST;
                case "admin", "administrator" -> ADMIN;
                default -> throw new IllegalArgumentException("Unsupported role value: " + value);
            };
        }
    }
}
