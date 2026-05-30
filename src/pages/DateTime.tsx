import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { BackBar, Btn } from '../ui';
import { C, TIME_SLOTS, BUSY, generateCalendar, getMonthLabel, DOW_NAMES } from '../data/catalog';
import { useAppointments } from '../hooks/useAppointments';
import { useEffect, useState } from 'react';

export default function DateTime() {
  const { booking, setBooking } = useBooking();
  const nav = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const selDate = booking.date ? Number(booking.date) : undefined;
  const selTime = booking.time;

  // View month state for calendar navigation
  const initialView = (() => {
    if (booking.month !== undefined && booking.year !== undefined) return new Date(booking.year, booking.month, 1);
    return new Date();
  })();
  const [viewDate, setViewDate] = useState(() => initialView);
  const [calDays, setCalDays] = useState(() => generateCalendar(initialView.getMonth(), initialView.getFullYear(), new Date()));

  useEffect(() => {
    setCalDays(generateCalendar(viewDate.getMonth(), viewDate.getFullYear(), new Date()));
  }, [viewDate]);

  // Keep current time fresh so past slots on today are automatically disabled.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Keep viewDate in sync when booking month/year changes (e.g., coming back from confirm)
  useEffect(() => {
    if (booking.month !== undefined && booking.year !== undefined) {
      const bv = new Date(booking.year, booking.month, 1);
      setViewDate(bv);
    }
  }, [booking.month, booking.year]);

  // Resolve selected day object and availability
  const dayObj = selDate ? (calDays.find(d => d && d.d === selDate) as any) : null;
  const dayAvailable = !!dayObj && dayObj.available;

  // If selected day becomes unavailable, clear selected time
  useEffect(() => {
    if (selDate && !dayAvailable) {
      setBooking((b: any) => ({ ...b, time: null }));
    }
  }, [selDate, dayAvailable]);

  // Build set of taken times for the currently selected day (reads stored appointments)
  const { appointments } = useAppointments();

  const takenTimes = (() => {
    const s = new Set<string>();
    if (!dayObj) return s;
    try {
      for (const a of appointments) {
        if (!a || a.status === 'canceled' || !a.data_hora) continue;
        const dt = new Date(a.data_hora);
        if (
          dt.getFullYear() === viewDate.getFullYear() &&
          dt.getMonth() === viewDate.getMonth() &&
          dt.getDate() === dayObj.d
        ) {
          s.add(a.data_hora.slice(11, 16));
        }
      }
    } catch { /* ignore errors */ }
    return s;
  })();

  return (
    <>
      <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 flex flex-col min-h-screen pb-40 sm:pb-24">
        <BackBar title="Data e Horário" onBack={() => nav(-1 as any)} />

        <div className="mt-6 flex flex-col gap-8">
          {/* Calendar */}
          <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <div className="mb-6 flex items-center justify-between px-2">
              <button
                className="tap border-none bg-transparent text-2xl sm:text-3xl leading-none text-cream3 hover:text-cream"
                onClick={() => {
                  setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
                  setBooking((b: any) => ({ ...b, date: null, month: undefined, year: undefined, time: null }));
                }}
              >←</button>
              <span className="font-sans text-base sm:text-lg font-bold text-cream">{getMonthLabel(viewDate.getMonth(), viewDate.getFullYear())}</span>
              <button
                className="tap border-none bg-transparent text-2xl sm:text-3xl leading-none text-cream3 hover:text-cream"
                onClick={() => {
                  setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
                  setBooking((b: any) => ({ ...b, date: null, month: undefined, year: undefined, time: null }));
                }}
              >→</button>
            </div>
            {/* Day headers */}
            <div className="mb-3 grid grid-cols-7 gap-2">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => (
                <div key={i} className="text-center font-sans text-[10px] sm:text-xs font-medium text-cream3">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />;
                const isSel = selDate === day.d;
                const avail = day.available;
                return (
                  <button
                    key={i}
                    className={avail ? 'tap hover:ring-2 ring-gold/30' : ''}
                      onClick={() => avail && setBooking((b: any) => ({ ...b, date: b.date === day.d ? null : day.d, month: viewDate.getMonth(), year: viewDate.getFullYear(), time: null }))}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 16,
                      fontWeight: isSel ? 700 : day.isToday ? 600 : 400,
                      background: isSel ? C.gold : day.isToday ? C.s3 : 'transparent',
                      color: isSel ? '#0b0907' : avail ? C.cream : C.cream3,
                      border: day.isToday && !isSel ? `1px solid ${C.b2}` : 'none',
                      opacity: (day.isPast || day.isWeekend) && !day.isToday ? 0.3 : 1,
                      cursor: avail ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                    }}
                  >
                      {day.d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selDate && (
            <div className="animate-fade-up">
              <div className="mb-4 font-sans text-base sm:text-lg font-semibold text-cream">
                {(() => {
                  const dayObj = calDays.find(d => d && d.d === selDate) as any;
                  const label = dayObj ? DOW_NAMES[dayObj.dow] : '';
                  return `${label}, ${selDate} de ${getMonthLabel(viewDate.getMonth(), viewDate.getFullYear()).split(' ')[0]} — Horários`;
                })()}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
                {TIME_SLOTS.map((t) => {
                  // if the day itself is unavailable, treat all slots as busy
                  // Special override: force-disable 18/06 at 10:00
                  const isOverrideBlocked = (() => {
                    try {
                      // month index: 5 = June
                      return viewDate.getMonth() === 5 && dayObj && dayObj.d === 18 && t === '10:00';
                    } catch { return false; }
                  })();
                  const isTodaySelected = !!dayObj
                    && dayObj.d === now.getDate()
                    && viewDate.getMonth() === now.getMonth()
                    && viewDate.getFullYear() === now.getFullYear();
                  const [hh, mm] = t.split(':').map(Number);
                  const slotMinutes = (hh * 60) + mm;
                  const nowMinutes = (now.getHours() * 60) + now.getMinutes();
                  const isPastTimeToday = isTodaySelected && slotMinutes <= nowMinutes;
                  const isBusy = !dayAvailable || BUSY.has(t) || isOverrideBlocked || takenTimes.has(t) || isPastTimeToday;
                  const isSel = selTime === t;
                  return (
                    <button
                      key={t}
                      className={!isBusy ? 'tap hover:scale-105' : ''}
                      aria-disabled={isBusy}
                      title={isOverrideBlocked ? 'Horário bloqueado (manualmente desativado)' : undefined}
                      onClick={() => !isBusy && setBooking((b: any) => ({ ...b, time: b.time === t ? null : t }))}
                      style={{
                        height: 48,
                        borderRadius: 12,
                        background: isSel ? C.gold : isBusy ? C.s3 : C.s2,
                        border: `1px solid ${isSel ? C.gold : isBusy ? C.b1 : C.b2}`,
                        fontFamily: 'var(--font-sans)',
                        fontSize: 15,
                        fontWeight: isSel ? 700 : 500,
                        color: isSel ? '#0b0907' : isBusy ? C.cream3 : C.cream,
                        opacity: isBusy ? 0.28 : 1,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        transition: 'all 0.12s',
                        transform: isBusy ? 'scale(0.98)' : 'none',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {!dayAvailable && (
                <div className="text-center font-sans text-sm text-cream3 mb-4">
                  Este dia está indisponível — não há horários disponíveis.
                </div>
              )}
              <div className="flex gap-6 font-sans text-xs sm:text-sm text-cream3 mt-6 justify-center sm:justify-start">
                <span className="flex items-center gap-1.5"><span className="block w-3 h-3 rounded-sm border" style={{ borderColor: C.b2 }}></span> Disponível</span>
                <span className="flex items-center gap-1.5" style={{ color: C.gold2 }}><span className="block w-3 h-3 rounded-sm" style={{ background: C.gold2 }}></span> Selecionado</span>
                <span className="flex items-center gap-1.5" style={{ opacity: 0.5 }}><span className="block w-3 h-3 rounded-sm border" style={{ borderColor: C.b2 }}></span> Ocupado</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {selDate && selTime && (
        <div className="fixed bottom-20 sm:bottom-0 left-0 right-0 p-4 sm:p-6 bg-s1/80 backdrop-blur-md border-t border-b1 z-50">
          <div className="max-w-screen-md mx-auto">
            <Btn onClick={() => nav('/confirm')} style={{ height: 56, fontSize: 16 }}>Confirmar Horário → {selTime}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
