export interface Booking {
  id: number;
  propertyId: number;
  userId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
