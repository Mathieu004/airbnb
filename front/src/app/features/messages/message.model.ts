export interface MessageUser {
  id: number;
  username?: string;
  email?: string;
}

export interface MessageProperty {
  id: number;
  name?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface MessageBooking {
  id: number;
  startDate: string;
  endDate: string;
}

export interface Message {
  id: number;
  sender: MessageUser;
  recipient: MessageUser;
  property: MessageProperty;
  booking?: MessageBooking | null;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface CreateMessageRequest {
  senderId: number;
  recipientId?: number;
  propertyId: number;
  bookingId?: number;
  content: string;
}
