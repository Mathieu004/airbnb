package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.PropertyDto;
import rentEasy.model.Property;
import rentEasy.service.PropertyService;

import java.util.List;

@RestController
@RequestMapping({"/api/properties", "/api/property"})
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public List<PropertyDto> getAll(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole
    ) {
        Long effectiveUserId = userId != null ? userId : headerUserId;
        String effectiveRole = role != null && !role.isBlank() ? role : headerRole;

        return propertyService.findAll(effectiveUserId, effectiveRole)
                .stream()
                .map(PropertyDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public PropertyDto getById(@PathVariable Long id) {
        return PropertyDto.fromEntity(propertyService.findById(id));
    }

    @GetMapping("/{id}/details")
    public PropertyDto getDetails(@PathVariable Long id) {
        return PropertyDto.fromEntity(propertyService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Property create(@Valid @RequestBody Property property) {
        return propertyService.create(property);
    }

    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @Valid @RequestBody Property property) {
        return propertyService.update(id, property);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }
}
