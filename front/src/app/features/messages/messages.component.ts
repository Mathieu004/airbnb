import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Booking } from '../bookings/booking.model';
import { BookingService } from '../bookings/bookingService';
import { Property } from '../properties/property.model';
import { PropertyService } from '../properties/propertyService';
import { Message } from './message.model';
import { MessageService } from './messageService';

type Conversation = {
  key: string;
  propertyId: number;
  bookingId?: number;
  contactId: number;
  contactName: string;
  contactEmail: string;
  propertyName: string;
  propertyLocation: string;
  bookingDates: string;
  lastMessage: Message;
};

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  selectedProperty?: Property;
  selectedBooking?: Booking;
  selectedConversation?: Conversation;
  conversations: Conversation[] = [];
  messages: Message[] = [];
  isLoading = false;
  errorMessage = '';
  draftMessage = '';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConversations();

    this.route.queryParamMap.subscribe(params => {
      const bookingId = Number(params.get('bookingId'));
      const propertyId = Number(params.get('propertyId'));

      this.resetSelectedContext();

      if (Number.isFinite(bookingId) && bookingId > 0) {
        this.loadBookingContext(bookingId, propertyId);
        return;
      }

      if (Number.isFinite(propertyId) && propertyId > 0) {
        this.loadPropertyContext(propertyId);
      }
    });
  }

  get hasContext(): boolean {
    return !!(this.selectedProperty || this.selectedBooking || this.selectedConversation);
  }

  get contactName(): string {
    if (this.selectedConversation) {
      return this.selectedConversation.contactName;
    }
    if (this.authService.getCurrentUserRole() === 'HOST') {
      return this.selectedBooking?.guest?.username || 'Client';
    }
    return this.selectedProperty?.host?.username || 'Hote';
  }

  get contactEmail(): string {
    if (this.selectedConversation) {
      return this.selectedConversation.contactEmail;
    }
    if (this.authService.getCurrentUserRole() === 'HOST') {
      return this.selectedBooking?.guest?.email || '';
    }
    return this.selectedProperty?.host?.email || '';
  }

  get propertyName(): string {
    return this.selectedConversation?.propertyName
      || this.selectedProperty?.name
      || this.selectedBooking?.property?.name
      || 'Logement';
  }

  get propertyLocation(): string {
    if (this.selectedConversation) {
      return this.selectedConversation.propertyLocation;
    }

    const property = this.selectedProperty;
    if (property?.address || property?.city || property?.country) {
      return [property.address, property.city, property.country].filter(Boolean).join(', ');
    }

    const bookingProperty = this.selectedBooking?.property;
    return [bookingProperty?.city, bookingProperty?.country].filter(Boolean).join(', ');
  }

  get bookingDates(): string {
    if (this.selectedConversation) {
      return this.selectedConversation.bookingDates;
    }
    if (!this.selectedBooking) {
      return '';
    }
    return `${this.selectedBooking.startDate} -> ${this.selectedBooking.endDate}`;
  }

  get conversationInitials(): string {
    return this.getInitials(this.contactName);
  }

  get canSend(): boolean {
    return !!this.draftMessage.trim() && this.hasContext && !this.isLoading;
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.selectedProperty = undefined;
    this.selectedBooking = undefined;
    this.loadThread(conversation.propertyId, conversation.bookingId);
  }

  sendMessage(): void {
    const senderId = this.authService.getCurrentUserId();
    const propertyId = this.getSelectedPropertyId();
    const bookingId = this.getSelectedBookingId();
    const content = this.draftMessage.trim();

    if (!senderId || !propertyId || !content) {
      return;
    }

    this.isLoading = true;
    const recipientId = this.selectedConversation?.contactId;

    this.messageService.create({ senderId, recipientId, propertyId, bookingId, content }).subscribe({
      next: () => {
        this.draftMessage = '';
        this.loadConversations();
        this.loadThread(propertyId, bookingId);
      },
      error: () => {
        this.errorMessage = 'Impossible d envoyer le message.';
        this.isLoading = false;
      }
    });
  }

  private loadConversations(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return;
    }

    this.messageService.getByUserId(userId).subscribe({
      next: messages => {
        this.conversations = this.buildConversations(messages, userId);
      }
    });
  }

  private loadBookingContext(bookingId: number, fallbackPropertyId?: number): void {
    this.isLoading = true;
    this.bookingService.getById(bookingId).subscribe({
      next: booking => {
        this.selectedBooking = booking;
        const propertyId = booking.property?.id ?? fallbackPropertyId;
        if (propertyId) {
          this.loadPropertyContext(propertyId, bookingId);
          return;
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cette reservation.';
        this.isLoading = false;
      }
    });
  }

  private loadPropertyContext(propertyId: number, bookingId?: number): void {
    this.isLoading = true;
    this.propertyService.getById(propertyId).subscribe({
      next: property => {
        this.selectedProperty = property;
        this.errorMessage = '';
        this.loadThread(propertyId, bookingId);
      },
      error: () => {
        this.errorMessage = 'Impossible de charger ce logement.';
        this.isLoading = false;
      }
    });
  }

  private loadThread(propertyId: number, bookingId?: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.messages = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.messageService.getThread(userId, propertyId, bookingId).subscribe({
      next: messages => {
        this.messages = messages;
        this.errorMessage = '';
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les messages.';
        this.isLoading = false;
      }
    });
  }

  private buildConversations(messages: Message[], currentUserId: number): Conversation[] {
    const grouped = new Map<string, Conversation>();

    messages.forEach(message => {
      const bookingId = message.booking?.id;
      const key = `${message.property.id}-${bookingId ?? 'property'}`;
      if (grouped.has(key)) {
        return;
      }

      const contact = message.sender.id === currentUserId ? message.recipient : message.sender;
      grouped.set(key, {
        key,
        propertyId: message.property.id,
        bookingId,
        contactId: contact.id,
        contactName: contact.username || 'Interlocuteur',
        contactEmail: contact.email || '',
        propertyName: message.property.name || 'Logement',
        propertyLocation: [message.property.address, message.property.city, message.property.country].filter(Boolean).join(', '),
        bookingDates: message.booking ? `${message.booking.startDate} -> ${message.booking.endDate}` : '',
        lastMessage: message
      });
    });

    return Array.from(grouped.values());
  }

  private getSelectedPropertyId(): number | undefined {
    return this.selectedConversation?.propertyId
      ?? this.selectedProperty?.id
      ?? this.selectedBooking?.property?.id
      ?? this.selectedBooking?.propertyId;
  }

  private getSelectedBookingId(): number | undefined {
    return this.selectedConversation?.bookingId ?? this.selectedBooking?.id;
  }

  private resetSelectedContext(): void {
    this.selectedProperty = undefined;
    this.selectedBooking = undefined;
    this.selectedConversation = undefined;
    this.messages = [];
    this.errorMessage = '';
    this.draftMessage = '';
  }

  getInitials(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || 'MS';
  }

  isOwnMessage(message: Message): boolean {
    return message.sender.id === this.authService.getCurrentUserId();
  }
}
