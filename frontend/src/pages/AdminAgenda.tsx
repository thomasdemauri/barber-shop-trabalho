import { useMemo, useState } from 'react';
import type { AppointmentStatus } from '../api/types';
import { StaffAppointmentCard } from '../components/admin/StaffAppointmentCard';
import { STATUS_LABEL } from '../lib/appointment-status';
import { useAppointments } from '../hooks/useAppointments';
import { useStaffDecisions } from '../hooks/useStaffDecisions';
import { onDay } from '../lib/appointments';
import { DOW_NAMES, MONTH_ABBR, toDateKey } from '../lib/dates';
import { C } from '../theme';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '../ui/Icons';

type Filter = 'all' | AppointmentStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'completed', label: 'Concluídos' },
  { key: 'canceled', label: 'Cancelados' },
];

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export default function AdminAgenda() {
  const { appointments } = useAppointments();
  const { busyId, decide } = useStaffDecisions();
  const [day, setDay] = useState(() => new Date());
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const dayKey = toDateKey(day);
  const isToday = dayKey === toDateKey(new Date());
  const dayAppointments = useMemo(() => onDay(appointments, dayKey), [appointments, dayKey]);
  const visible = filter === 'all' ? dayAppointments : dayAppointments.filter(a => a.status === filter);
  const countOf = (key: Filter) => (key === 'all' ? dayAppointments.length : dayAppointments.filter(a => a.status === key).length);

  const goTo = (next: Date) => {
    setDay(next);
    setOpenId(null);
  };

  const summary = [
    { label: 'Total', value: dayAppointments.length, color: C.gold2 },
    { label: 'Confirmados', value: countOf('confirmed'), color: C.green },
    { label: 'Pendentes', value: countOf('pending'), color: C.gold2 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream flex items-center gap-3">
          <IconCalendar size={24} className="text-gold" /> Agenda
        </h1>
      </div>

      <div className="flex items-center justify-between mb-6 rounded-2xl p-3" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
        <button className="tap flex items-center gap-1 rounded-xl px-3 py-2 font-sans text-sm font-medium transition-colors hover:bg-s3" style={{ color: C.cream2 }}
          onClick={() => goTo(addDays(day, -1))}>
          <IconChevronLeft size={16} /> Anterior
        </button>

        <div className="flex items-center gap-3">
          <span className="font-sans text-sm font-semibold text-cream">
            {DOW_NAMES[day.getDay()]}, {day.getDate()} de {MONTH_ABBR[day.getMonth()]}
          </span>
          {!isToday && (
            <button className="tap rounded-lg px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ background: C.goldBg, color: C.gold2, border: `1px solid ${C.gold}28` }}
              onClick={() => goTo(new Date())}>
              Hoje
            </button>
          )}
        </div>

        <button className="tap flex items-center gap-1 rounded-xl px-3 py-2 font-sans text-sm font-medium transition-colors hover:bg-s3" style={{ color: C.cream2 }}
          onClick={() => goTo(addDays(day, 1))}>
          Próximo <IconChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scroll-x">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button key={key}
              className="tap shrink-0 rounded-xl px-4 py-2 font-sans text-[12px] font-semibold transition-all"
              style={{
                background: active ? C.gold : 'transparent',
                color: active ? C.bg : C.cream2,
                border: `1px solid ${active ? C.gold : C.b1}`,
              }}
              onClick={() => { setFilter(key); setOpenId(null); }}>
              {label} ({countOf(key)})
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <IconCalendar size={32} style={{ color: C.cream3 }} />
            <p className="font-sans text-sm" style={{ color: C.cream3 }}>
              {filter === 'all' ? 'Nenhum agendamento neste dia' : `Nenhum agendamento ${STATUS_LABEL[filter].toLowerCase()} neste dia`}
            </p>
          </div>
        ) : (
          visible.map(appointment => (
            <StaffAppointmentCard
              key={appointment.id}
              appointment={appointment}
              badge="time"
              now={new Date()}
              open={openId === appointment.id}
              busy={busyId === appointment.id}
              onToggle={() => setOpenId(openId === appointment.id ? null : appointment.id)}
              onDecide={decision => { void decide(appointment.id, decision).then(() => setOpenId(null)); }}
            />
          ))
        )}
      </div>

      {dayAppointments.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-6 rounded-2xl p-4" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          {summary.map(({ label, value, color }, index) => (
            <div key={label} className="flex items-center gap-6">
              {index > 0 && <div className="w-px h-8" style={{ background: C.b1 }} />}
              <div className="text-center">
                <div className="font-serif text-lg font-bold" style={{ color }}>{value}</div>
                <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
