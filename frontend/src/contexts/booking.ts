import { createContext } from 'react';
import type { Barber, Service, Slot } from '../api/types';

/** The booking being assembled across the Services → Barber → DateTime → Confirm screens. */
export type Booking = {
  service?: Service;
  /** `null` means "no preference": the API assigns the first free barber. */
  barber?: Barber | null;
  dateKey?: string;
  slot?: Slot;
};

export type BookingContextValue = {
  booking: Booking;
  setBooking: (update: (booking: Booking) => Booking) => void;
  clear: () => void;
};

export const BookingContext = createContext<BookingContextValue | undefined>(undefined);
