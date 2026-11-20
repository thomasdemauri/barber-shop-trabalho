import React, { useMemo, useState } from 'react';
import { BookingContext, type Booking } from './booking';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booking, setBookingState] = useState<Booking>({});
  const value = useMemo(() => ({
    booking,
    setBooking: (update: (booking: Booking) => Booking) => setBookingState(update),
    clear: () => setBookingState({}),
  }), [booking]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
