package rentEasy.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rentEasy.controller.dto.PropertyRequest;
import rentEasy.dataBase.Role;
import rentEasy.model.Property;
import rentEasy.model.PropertyImage;
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
    public Property create(PropertyRequest request) {
        Property property = new Property();
        property.setId(null);
        applyRequest(property, request);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property update(Long propertyId, PropertyRequest request) {
        Property existing = findById(propertyId);

        applyRequest(existing, request);
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

    private void applyRequest(Property property, PropertyRequest request) {
        property.setName(request.name().trim());
        property.setAddress(request.address() == null ? null : request.address().trim());
        property.setCity(request.city().trim());
        property.setCountry(request.country().trim());
        property.setDescription(request.description() == null ? null : request.description().trim());
        property.setPricePerNight(request.pricePerNight());
        property.setMaxGuestnumber(request.maxGuestnumber());
        property.setBedroomNumber(request.bedroomNumber());
        property.setBathroomNumber(request.bathroomNumber());
        property.setHasHairDryer(Boolean.TRUE.equals(request.hasHairDryer()));
        property.setHasWashMachine(Boolean.TRUE.equals(request.hasWashMachine()));
        property.setHasDryerMachine(Boolean.TRUE.equals(request.hasDryerMachine()));
        property.setHasAirConditioner(Boolean.TRUE.equals(request.hasAirConditioner()));
        property.setHasKitchen(Boolean.TRUE.equals(request.hasKitchen()));
        property.setHasHeater(Boolean.TRUE.equals(request.hasHeater()));
        property.setHasOven(Boolean.TRUE.equals(request.hasOven()));
        property.setHasCoffeeMachine(Boolean.TRUE.equals(request.hasCoffeeMachine()));
        property.setHasTV(Boolean.TRUE.equals(request.hasTV()));
        property.setHasWifi(Boolean.TRUE.equals(request.hasWifi()));
        property.setHasGarden(Boolean.TRUE.equals(request.hasGarden()));
        property.setAreAnimalsAllowed(Boolean.TRUE.equals(request.areAnimalsAllowed()));
        property.setCleaningOptionPrice(request.cleaningOptionPrice() == null ? 0 : request.cleaningOptionPrice());
        property.setType(request.type());
        property.setSize(request.size() == null ? 0 : request.size());
        property.setIsActive(request.isActive() == null || request.isActive());
        property.setHost(getUserReference(request.host().id()));

        Set<PropertyImage> images = new LinkedHashSet<>();
        if (request.images() != null) {
            request.images().forEach(imageRequest -> {
                PropertyImage image = PropertyImage.builder()
                        .imageUrl(imageRequest.imageUrl().trim())
                        .isMain(Boolean.TRUE.equals(imageRequest.isMain()))
                        .property(property)
                        .build();
                images.add(image);
            });
        }
        property.getImages().clear();
        property.getImages().addAll(images);
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
