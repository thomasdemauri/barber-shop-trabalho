// Design Tokens
export const C = {
  bg: '#0b0907', s1: '#151210', s2: '#1d1a16', s3: '#262320', s4: '#2f2b25',
  gold: '#c4912a', gold2: '#d4a84c', gold3: '#eacf78', goldBg: '#1e1508',
  cream: '#f0e3c4', cream2: '#b0a080', cream3: '#6a5c44',
  b1: '#222018', b2: '#3c3428',
  green: '#4a9d6e', greenBg: '#0c2216',
  red: '#c05050', redBg: '#280e0e',
};

// Services
export type Service = {
  id: number;
  icon: string;
  name: string;
  desc: string;
  price: number;
  cat: string;
  duration: number;
};

export const SERVICES: Service[] = [
  { id: 1, icon: 'C',  name: 'Corte Clássico',       desc: '40 min · Tesoura ou máquina',     price: 40,  cat: 'corte', duration: 40 },
  { id: 2, icon: 'CB', name: 'Corte + Barba',         desc: '70 min · Combo premium',          price: 65,  cat: 'combo', duration: 70 },
  { id: 3, icon: 'B',  name: 'Barba Completa',        desc: '30 min · Navalha profissional',   price: 35,  cat: 'barba', duration: 30 },
  { id: 4, icon: 'H',  name: 'Hidratação Capilar',    desc: '20 min · Tratamento profundo',    price: 30,  cat: 'trat',  duration: 20 },
  { id: 5, icon: 'D',  name: 'Design de Sobrancelha', desc: '15 min · Modelagem precisa',      price: 20,  cat: 'trat',  duration: 15 },
  { id: 6, icon: 'Co', name: 'Coloração',              desc: '90 min · Platinado, luzes, ombré', price: 120, cat: 'trat',  duration: 90 },
];

// Barbers
export type Barber = {
  id: number;
  name: string;
  exp: string;
  rating: number;
  reviews: number;
  icon: string;
  specialty: string;
};

export const BARBERS: Barber[] = [
  { id: 1, name: 'João Mestre',    exp: '12 anos', rating: 4.9, reviews: 380, icon: 'JM', specialty: 'Cortes clássicos e degradê' },
  { id: 2, name: 'Pedro Silva',    exp: '7 anos',  rating: 4.7, reviews: 210, icon: 'PS', specialty: 'Barba e tratamentos capilares' },
  { id: 3, name: 'Carlos Barbosa', exp: '10 anos', rating: 4.8, reviews: 290, icon: 'CB', specialty: 'Cortes modernos e coloração' },
];

// Time Slots
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];
export const BUSY = new Set(['09:00', '09:30', '11:00', '15:30']);

// Calendar Data (May 2026)
// May 1, 2026 = Friday (dow=5)
export type CalDay = {
  d: number;
  dow: number;
  isWeekend: boolean;
  isPast: boolean;
  isToday: boolean;
  available: boolean;
} | null;

export const CAL_DAYS: CalDay[] = (() => {
  const arr: CalDay[] = Array(5).fill(null); // 5 empty slots before day 1 (Fri)
  for (let d = 1; d <= 31; d++) {
    const dow = (5 + d - 1) % 7;
    arr.push({
      d,
      dow,
      isWeekend: dow === 0 || dow === 6,
      isPast: d < 12,
      isToday: d === 12,
      available: d > 12 && dow !== 0 && dow !== 6,
    });
  }
  return arr;
})();

export const DOW_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const getDayLabel = (d: number) => DOW_NAMES[(5 + d - 1) % 7];

// Duration Lookup
export const SVC_DUR: Record<number, string> = {
  1: '40 min', 2: '70 min', 3: '30 min', 4: '20 min', 5: '15 min', 6: '90 min',
};

// Mock Appointments
export type MockAppointment = {
  id: number;
  d: number;
  mon: string;
  svc: string;
  barber: string;
  time: string;
  status: string;
  price: number;
};

export const UPCOMING: MockAppointment[] = [
  { id: 1, d: 15, mon: 'MAI', svc: 'Corte + Barba',   barber: 'João Mestre',    time: '14:00', status: 'confirmed', price: 65 },
  { id: 2, d: 22, mon: 'MAI', svc: 'Corte Clássico',  barber: 'Carlos Barbosa', time: '10:00', status: 'pending',   price: 40 },
];

export const HISTORY: MockAppointment[] = [
  { id: 3, d: 28, mon: 'ABR', svc: 'Barba Completa', barber: 'João Mestre',  time: '11:00', status: 'done', price: 35 },
  { id: 4, d: 14, mon: 'ABR', svc: 'Corte + Barba',  barber: 'Pedro Silva',  time: '15:00', status: 'done', price: 65 },
];

// Admin Timeline
export type AdminTimelineItem = {
  time: string;
  client: string | null;
  svc: string;
  dur: string;
  status: 'done' | 'next' | 'upcoming' | 'break';
};

export const ADMIN_TL: AdminTimelineItem[] = [
  { time: '09:00', client: 'Carlos R.',  svc: 'Barba',           dur: '30 min', status: 'done' },
  { time: '10:00', client: 'Paulo S.',   svc: 'Corte Clássico',  dur: '40 min', status: 'next' },
  { time: '11:30', client: 'Marcus L.',  svc: 'Corte + Barba',   dur: '70 min', status: 'upcoming' },
  { time: '13:00', client: null,         svc: 'Almoço',           dur: '60 min', status: 'break' },
  { time: '14:00', client: 'Rafael C.',  svc: 'Hidratação',       dur: '20 min', status: 'upcoming' },
  { time: '15:30', client: 'Thiago M.',  svc: 'Corte Clássico',  dur: '40 min', status: 'upcoming' },
];
