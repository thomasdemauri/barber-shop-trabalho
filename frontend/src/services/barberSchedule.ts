import { BARBERS, TIME_SLOTS } from '../data/catalog';

export type BarberSchedule = {
  barberId: number;
  openTime: string;
  closeTime: string;
  weekdays: number[];
};

const BARBER_SCHEDULE_PREFIX = 'barbershop_barber_schedule_';

export const DEFAULT_BARBER_SCHEDULE: Omit<BarberSchedule, 'barberId'> = {
  openTime: '08:00',
  closeTime: '18:00',
  weekdays: [1, 2, 3, 4, 5],
};

function cloneDefault(barberId: number): BarberSchedule {
  return {
    barberId,
    openTime: DEFAULT_BARBER_SCHEDULE.openTime,
    closeTime: DEFAULT_BARBER_SCHEDULE.closeTime,
    weekdays: [...DEFAULT_BARBER_SCHEDULE.weekdays],
  };
}

function keyFor(barberId: number) {
  return `${BARBER_SCHEDULE_PREFIX}${barberId}`;
}

export function resolveBarberIdByName(barberName?: string | null) {
  if (!barberName) return null;
  const barber = BARBERS.find(b => b.name.toLowerCase() === barberName.toLowerCase());
  return barber?.id ?? null;
}

export function loadBarberSchedule(barberId?: number | null) {
  if (!barberId) return null;
  try {
    const raw = localStorage.getItem(keyFor(barberId));
    if (raw) {
      const parsed = JSON.parse(raw) as BarberSchedule;
      if (parsed && parsed.barberId === barberId) return parsed;
    }
  } catch {
    // fall through to default
  }
  return cloneDefault(barberId);
}

export function ensureBarberSchedule(barberId: number) {
  const existing = loadBarberSchedule(barberId);
  if (!localStorage.getItem(keyFor(barberId))) {
    saveBarberSchedule(existing!);
  }
  return existing!;
}

export function saveBarberSchedule(schedule: BarberSchedule) {
  localStorage.setItem(keyFor(schedule.barberId), JSON.stringify(schedule));
}

export function loadAllBarberSchedules() {
  return BARBERS.map(barber => loadBarberSchedule(barber.id)!);
}

export function getBarberSchedule(barberId?: number | null) {
  return loadBarberSchedule(barberId);
}

export function isTimeWithinRange(time: string, openTime: string, closeTime: string) {
  return time >= openTime && time <= closeTime;
}

export function getAvailableTimesForBarber(barberId?: number | null, dayDow?: number) {
  const schedule = getBarberSchedule(barberId);
  if (!schedule) return TIME_SLOTS;
  return TIME_SLOTS.filter(t => {
    const inDay = dayDow === undefined ? true : schedule.weekdays.includes(dayDow);
    return inDay && isTimeWithinRange(t, schedule.openTime, schedule.closeTime);
  });
}
