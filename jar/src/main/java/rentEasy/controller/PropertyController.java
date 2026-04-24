package rentEasy.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.PropertyDto;
import rentEasy.controller.dto.PropertyRequest;
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
    @Transactional
    public PropertyDto create(@Valid @RequestBody PropertyRequest request) {
        return PropertyDto.fromEntity(propertyService.create(request));
    }

    @PutMapping("/{id}")
    @Transactional
    public PropertyDto update(@PathVariable Long id, @Valid @RequestBody PropertyRequest request) {
        return PropertyDto.fromEntity(propertyService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public PropertyDto updateStatus(@PathVariable Long id, @RequestBody UpdatePropertyStatusRequest request) {
        return PropertyDto.fromEntity(propertyService.updateStatus(id, request.isActive()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }

    public record UpdatePropertyStatusRequest(@JsonProperty("isActive") Boolean isActive) {
    }
}
