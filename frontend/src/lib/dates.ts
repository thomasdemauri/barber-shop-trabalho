export const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const MONTH_ABBR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export const DOW_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const pad = (value: number) => String(value).padStart(2, '0');

/** "YYYY-MM-DD" for a local calendar day — the format the API uses for dates. */
export const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type CalendarDay = { day: number; weekday: number; dateKey: string; isPast: boolean; isToday: boolean };

/** Month grid starting on Sunday; `null` entries pad the first week. */
export function monthGrid(year: number, month: number, today: Date): (CalendarDay | null)[] {
  const todayKey = toDateKey(today);
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (CalendarDay | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = toDateKey(new Date(year, month, day));
    days.push({ day, weekday: (leading + day - 1) % 7, dateKey, isPast: dateKey < todayKey, isToday: dateKey === todayKey });
  }
  return days;
}

export const monthLabel = (year: number, month: number) => `${MONTH_NAMES[month]} ${year}`;

/** Weekday, day and month of a date key, e.g. "Ter, 17 de Novembro". */
export function longDateLabel(dateKey: string) {
  const date = fromDateKey(dateKey);
  return `${DOW_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function dateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: date.getDate(),
    month: MONTH_ABBR[date.getMonth()],
    weekday: DOW_NAMES[date.getDay()],
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    dateKey: toDateKey(date),
  };
}
