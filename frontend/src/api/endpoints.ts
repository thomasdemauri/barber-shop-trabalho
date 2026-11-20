import { request } from './client';
import type {
  ApiAppointment,
  ApiUser,
  Appointment,
  Availability,
  Barber,
  BarberSchedule,
  Preferences,
  Service,
  ServiceInput,
  Session,
  ShopSettings,
  WorkingDay,
} from './types';

export const toAppointment = (appointment: ApiAppointment): Appointment => ({
  ...appointment,
  status: appointment.status.toLowerCase() as Appointment['status'],
});

export const authApi = {
  login: (email: string, password: string) => request<Session>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (input: { name: string; email: string; phone?: string; password: string }) =>
    request<Session>('/auth/register', { method: 'POST', body: input }),
  me: () => request<ApiUser>('/auth/me'),
  forgotPassword: (email: string) => request<void>('/auth/password/forgot', { method: 'POST', body: { email } }),
  resetPassword: (token: string, newPassword: string) =>
    request<void>('/auth/password/reset', { method: 'POST', body: { token, newPassword } }),
};

export type ProfileChanges = { name?: string; email?: string; phone?: string; currentPassword?: string; newPassword?: string };

export const profileApi = {
  update: (changes: ProfileChanges) => request<ApiUser>('/profile', { method: 'PATCH', body: changes }),
  preferences: () => request<Preferences>('/profile/preferences'),
  updatePreferences: (changes: Partial<Preferences>) =>
    request<Preferences>('/profile/preferences', { method: 'PATCH', body: changes }),
};

export const catalogApi = {
  services: () => request<Service[]>('/catalog/services'),
  barbers: () => request<Barber[]>('/catalog/barbers'),
  allServices: () => request<Service[]>('/admin/services'),
  createService: (input: ServiceInput) => request<Service>('/admin/services', { method: 'POST', body: input }),
  updateService: (id: string, changes: Partial<Service>) =>
    request<Service>(`/admin/services/${id}`, { method: 'PATCH', body: changes }),
};

export const schedulingApi = {
  availability: (query: { date: string; serviceId: string; barberId?: string; ignoreAppointmentId?: string }) =>
    request<Availability>('/availability', { query }),
  schedules: () => request<BarberSchedule[]>('/schedules'),
  mySchedule: () => request<BarberSchedule>('/schedules/me'),
  updateMySchedule: (days: WorkingDay[]) => request<BarberSchedule>('/schedules/me', { method: 'PUT', body: { days } }),
};

export const appointmentsApi = {
  list: async () => (await request<ApiAppointment[]>('/appointments')).map(toAppointment),
  book: async (input: { serviceId: string; startsAt: string; barberId?: string }) =>
    toAppointment(await request<ApiAppointment>('/appointments', { method: 'POST', body: input })),
  reschedule: async (id: string, changes: { serviceId?: string; startsAt?: string }) =>
    toAppointment(await request<ApiAppointment>(`/appointments/${id}`, { method: 'PATCH', body: changes })),
  cancel: (id: string) => request<void>(`/appointments/${id}`, { method: 'DELETE' }),
  decide: async (id: string, status: 'CONFIRMED' | 'CANCELED' | 'COMPLETED') =>
    toAppointment(await request<ApiAppointment>(`/admin/appointments/${id}`, { method: 'PATCH', body: { status } })),
};

export const adminApi = {
  clients: () => request<ApiUser[]>('/admin/clients'),
};

export const shopApi = {
  settings: () => request<ShopSettings>('/shop/settings'),
  updateSettings: (settings: ShopSettings) => request<ShopSettings>('/admin/shop/settings', { method: 'PUT', body: settings }),
};
