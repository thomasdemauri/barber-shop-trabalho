import { useContext } from 'react';
import { BookingContext } from '../contexts/booking';

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
