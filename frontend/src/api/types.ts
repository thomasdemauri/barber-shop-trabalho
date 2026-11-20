export type Role = 'CLIENT' | 'BARBER' | 'ADMIN';

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
};

export type Session = { token: string; user: ApiUser };

export type Service = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export type ServiceInput = Omit<Service, 'id' | 'active'>;

export type Barber = {
  id: string;
  name: string;
  experience: string | null;
  bio: string | null;
  rating: number;
  reviews: number;
};

export type ApiAppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';

export type ApiAppointment = {
  id: string;
  status: ApiAppointmentStatus;
  startsAt: string;
  endsAt: string;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string; phone: string | null };
  barber: { id: string; name: string };
  service: { id: string; name: string; price: number; durationMinutes: number };
};

export type AppointmentStatus = Lowercase<ApiAppointmentStatus>;
export type Appointment = Omit<ApiAppointment, 'status'> & { status: AppointmentStatus };

export type Slot = { time: string; startsAt: string; available: boolean };
export type Availability = { date: string; slots: Slot[] };

export type WorkingDay = { weekday: number; openTime: string; closeTime: string };
export type BarberSchedule = { barberId: string; days: WorkingDay[] };

export type HaircutPreferences = { style: string; beard: string; notes: string };
export type NotificationPreferences = {
  confirmation: boolean;
  reminder: boolean;
  promotions: boolean;
  cancellation: boolean;
  news: boolean;
};
export type PaymentPreferences = { preferredMethod: string; pixKey: string };
export type Preferences = {
  haircut: HaircutPreferences | null;
  notifications: NotificationPreferences | null;
  payment: PaymentPreferences | null;
};

export type ShopSettings = { name: string };
