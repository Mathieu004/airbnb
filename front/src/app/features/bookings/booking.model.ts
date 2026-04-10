export interface Booking {
  id?: number;
  property?: {
    id: number;
    name?: string;
    city?: string;
    country?: string;
  };
  guest?: {
    id?: number;
    username?: string;
    email?: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  reservationDate?: string;
  propertyId?: number;
  guestUsername?: string;
}
