import { useContext } from 'react';
import { AppointmentContext } from '../contexts/appointments';

export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used inside AppointmentProvider');
  return ctx;
}
