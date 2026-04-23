import { Booking } from './booking.model';

export interface BookingDateRange {
  start: Date;
  end: Date;
}

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toBookingRanges(bookings: Booking[]): BookingDateRange[] {
  return bookings
    .filter((booking) => booking.status !== 'cancelled' && !!booking.startDate && !!booking.endDate)
    .map((booking) => ({
      start: startOfDay(parseLocalDate(booking.startDate)),
      end: startOfDay(parseLocalDate(booking.endDate))
    }));
}

export function isDateReserved(date: Date, ranges: BookingDateRange[]): boolean {
  const target = startOfDay(date);
  return ranges.some((range) => target >= range.start && target < range.end);
}

export function isRangeAvailable(start: Date, end: Date, ranges: BookingDateRange[]): boolean {
  const normalizedStart = startOfDay(start);
  const normalizedEnd = startOfDay(end);

  if (normalizedEnd <= normalizedStart) {
    return false;
  }

  return !ranges.some((range) => normalizedStart < range.end && normalizedEnd > range.start);
}
