import React, { createContext, useContext, useState } from 'react';

type Booking = {
  service?: any;
  barber?: any;
  date?: string; // e.g. 2026-05-14
  time?: string; // e.g. 14:00
};

type BookingCtx = {
  booking: Booking;
  setBooking: (fn: (b: Booking) => Booking) => void;
  clear: () => void;
};

const Ctx = createContext<BookingCtx | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booking, setBookingState] = useState<Booking>({});

  const setBooking = (fn: (b: Booking) => Booking) => setBookingState(prev => fn(prev));
  const clear = () => setBookingState({});

  return <Ctx.Provider value={{ booking, setBooking, clear }}>{children}</Ctx.Provider>;
};

export function useBooking(){
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
