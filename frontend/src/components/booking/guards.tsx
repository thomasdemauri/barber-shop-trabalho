import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';

/** /barber and /datetime need a service. */
export function RequireService({ children }: { children: ReactNode }) {
  const { booking } = useBooking();
  if (!booking.service) return <Navigate to="/services" replace />;
  return <>{children}</>;
}

/** /confirm needs a service and a time slot. */
export function RequireBookingComplete({ children }: { children: ReactNode }) {
  const { booking } = useBooking();
  if (!booking.service) return <Navigate to="/services" replace />;
  if (!booking.dateKey || !booking.slot) return <Navigate to="/datetime" replace />;
  return <>{children}</>;
}
