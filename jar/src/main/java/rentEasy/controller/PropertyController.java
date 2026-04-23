package rentEasy.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
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
            @RequestParam(value = "role", required = false) String role
    ) {
        return propertyService.findAll(userId, role)
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
    public PropertyDto create(@Valid @RequestBody Property property) {
        return PropertyDto.fromEntity(propertyService.create(property));
    }

    @PutMapping("/{id}")
    public PropertyDto update(@PathVariable Long id, @Valid @RequestBody Property property) {
        return PropertyDto.fromEntity(propertyService.update(id, property));
    }

    @PatchMapping("/{id}/status")
    public PropertyDto updateStatus(@PathVariable Long id, @RequestBody UpdatePropertyStatusRequest request) {
        return PropertyDto.fromEntity(propertyService.updateStatus(id, request.isActive()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }

    private record UpdatePropertyStatusRequest(@JsonProperty("isActive") Boolean isActive) {
    }
}
