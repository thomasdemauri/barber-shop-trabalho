import type { AppointmentStatus } from '../api/types';

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  confirmed: '#4a9d6e',
  pending: '#d4a84c',
  canceled: '#c05050',
  completed: '#6a5c44',
};

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  canceled: 'Cancelado',
  completed: 'Concluído',
};
