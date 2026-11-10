import React, { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

type Booking = {
  service?: any;
  barber?: any;
  date?: string;
  month?: number; // 0-11
  year?: number;
  time?: string;
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

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}

// ─── Guards de rota ───────────────────────────────────────────────────────────

/** /barber e /datetime requerem serviço selecionado */
export function RequireService({ children }: { children: React.ReactNode }) {
  const { booking } = useBooking();
  if (!booking.service) return <Navigate to="/services" replace />;
  return <>{children}</>;
}

/** /confirm requer serviço + data + horário */
export function RequireBookingComplete({ children }: { children: React.ReactNode }) {
  const { booking } = useBooking();
  if (!booking.service) return <Navigate to="/services" replace />;
  if (!booking.date || !booking.time) return <Navigate to="/datetime" replace />;
  return <>{children}</>;
}