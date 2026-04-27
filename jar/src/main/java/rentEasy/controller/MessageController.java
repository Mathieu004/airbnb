package rentEasy.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rentEasy.controller.dto.CreateMessageRequest;
import rentEasy.controller.dto.MessageDto;
import rentEasy.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<MessageDto> getByUserId(@RequestParam Long userId) {
        return messageService.findByUserId(userId)
                .stream()
                .map(MessageDto::fromEntity)
                .toList();
    }

    @GetMapping("/thread")
    public List<MessageDto> getThread(
            @RequestParam Long userId,
            @RequestParam Long propertyId,
            @RequestParam(required = false) Long bookingId
    ) {
        return messageService.findThread(userId, propertyId, bookingId)
                .stream()
                .map(MessageDto::fromEntity)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageDto create(@Valid @RequestBody CreateMessageRequest request) {
        return MessageDto.fromEntity(messageService.create(request));
    }
}
