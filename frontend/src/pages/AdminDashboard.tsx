import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Appointment } from '../api/types';
import { StaffAppointmentCard } from '../components/admin/StaffAppointmentCard';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';
import { useStaffDecisions } from '../hooks/useStaffDecisions';
import { onDay, revenue } from '../lib/appointments';
import { DOW_NAMES, MONTH_ABBR, toDateKey } from '../lib/dates';
import { firstName, formatPrice } from '../lib/format';
import { C } from '../theme';
import { IconClock, IconScissors } from '../ui/Icons';

const greetingFor = (hour: number) => (hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite');
const plural = (count: number, word: string) => `${count} ${word}${count !== 1 ? 's' : ''}`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { appointments } = useAppointments();
  const { busyId, decide } = useStaffDecisions();
  const nav = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  const now = new Date();
  const todayKey = toDateKey(now);
  const dateLabel = `${DOW_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTH_ABBR[now.getMonth()]}`;

  const notCanceled = appointments.filter(a => a.status !== 'canceled');
  const today = onDay(notCanceled, todayKey);
  const upcoming = notCanceled
    .filter(a => new Date(a.startsAt) > now && toDateKey(new Date(a.startsAt)) !== todayKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 10);
  const pending = appointments.filter(a => a.status === 'pending');
  const servedToday = today.filter(a => new Date(a.startsAt) < now);
  const nextToday = today.find(a => new Date(a.startsAt) >= now);

  const stats = [
    { label: 'Atendimentos', value: String(servedToday.length), sub: 'hoje' },
    { label: 'Faturamento', value: formatPrice(revenue(servedToday)), sub: 'hoje' },
    { label: 'Pendentes', value: String(pending.length), sub: 'aguardando', highlight: pending.length > 0 },
  ];

  const card = (appointment: Appointment) => (
    <StaffAppointmentCard
      key={appointment.id}
      appointment={appointment}
      badge="date"
      now={now}
      open={openId === appointment.id}
      busy={busyId === appointment.id}
      onToggle={() => setOpenId(openId === appointment.id ? null : appointment.id)}
      onDecide={decision => { void decide(appointment.id, decision).then(() => setOpenId(null)); }}
    />
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      <div className="mb-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderBottom: `1px solid ${C.b1}` }}>
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: C.cream3 }}>
            {greetingFor(now.getHours())} · {dateLabel}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream flex items-center gap-3">
            {firstName(user?.nome, 'Admin')} <IconScissors size={26} className="text-gold" />
          </h1>
        </div>
        <button
          className="tap self-start sm:self-auto rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-colors"
          style={{ background: C.s3, border: `1px solid ${C.b2}`, color: C.cream2 }}
          onClick={() => { logout(); nav('/login'); }}
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ value, label, sub, highlight }) => (
              <div key={label} className="rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[100px]"
                style={{ background: highlight ? C.goldBg : C.s2, border: `1px solid ${highlight ? `${C.gold}30` : C.b1}` }}>
                <div className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-snug" style={{ color: highlight ? C.gold2 : C.cream3 }}>{label}</div>
                <div className="font-serif text-lg sm:text-2xl font-bold leading-none" style={{ color: highlight ? C.gold2 : C.cream }}>{value}</div>
                <div className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>{sub}</div>
              </div>
            ))}
          </div>

          {pending.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>Aguardando confirmação</span>
                <span className="rounded-lg px-2.5 py-1 font-sans text-[11px] font-bold" style={{ background: `${C.gold}18`, color: C.gold2, border: `1px solid ${C.gold}28` }}>
                  {plural(pending.length, 'pendente')}
                </span>
              </div>
              <div className="flex flex-col gap-3">{pending.map(card)}</div>
            </div>
          )}

          {nextToday && (
            <div>
              <div className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>Próximo hoje</div>
              {card(nextToday)}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>
            Agenda de Hoje · {plural(today.length, 'agendamento')}
          </div>

          {today.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
              <IconClock size={32} style={{ color: C.cream3 }} />
              <p className="font-sans text-sm" style={{ color: C.cream3 }}>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">{today.map(card)}</div>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>Próximos dias</div>
              <div className="flex flex-col gap-3">{upcoming.map(card)}</div>
            </>
          )}

          {notCanceled.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
              <IconScissors size={32} style={{ color: C.cream3 }} />
              <p className="font-sans text-sm" style={{ color: C.cream3 }}>Nenhum agendamento ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
