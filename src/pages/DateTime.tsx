import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { BackBar, Btn } from '../ui';
import { C, CAL_DAYS, TIME_SLOTS, BUSY, getDayLabel } from '../data/catalog';

export default function DateTime() {
  const { booking, setBooking } = useBooking();
  const nav = useNavigate();
  const selDate = booking.date ? Number(booking.date) : undefined;
  const selTime = booking.time;

  return (
    <>
      <div className="w-full max-w-screen-md mx-auto p-4 sm:p-8 lg:p-10 flex flex-col min-h-screen pb-24">
        <BackBar title="Data e Horário" onBack={() => nav(-1 as any)} />

        <div className="mt-6 flex flex-col gap-8">
          {/* Calendar */}
          <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <div className="mb-6 flex items-center justify-between px-2">
              <button className="tap border-none bg-transparent text-2xl sm:text-3xl leading-none text-cream3 hover:text-cream">←</button>
              <span className="font-sans text-base sm:text-lg font-bold text-cream">Maio 2026</span>
              <button className="tap border-none bg-transparent text-2xl sm:text-3xl leading-none text-cream3 hover:text-cream">→</button>
            </div>
            {/* Day headers */}
            <div className="mb-3 grid grid-cols-7 gap-2">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => (
                <div key={i} className="text-center font-sans text-[10px] sm:text-xs font-medium text-cream3">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {CAL_DAYS.map((day, i) => {
                if (!day) return <div key={i} />;
                const isSel = selDate === day.d;
                const avail = day.available;
                return (
                  <button
                    key={i}
                    className={avail ? 'tap hover:ring-2 ring-gold/30' : ''}
                    onClick={() => avail && setBooking((b: any) => ({ ...b, date: b.date === day.d ? null : day.d, time: null }))}
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
                {getDayLabel(selDate)}, {selDate} de Maio — Horários
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
                {TIME_SLOTS.map((t) => {
                  const isBusy = BUSY.has(t);
                  const isSel = selTime === t;
                  return (
                    <button
                      key={t}
                      className={!isBusy ? 'tap hover:scale-105' : ''}
                      onClick={() => !isBusy && setBooking((b: any) => ({ ...b, time: b.time === t ? null : t }))}
                      style={{
                        height: 48,
                        borderRadius: 12,
                        background: isSel ? C.gold : isBusy ? C.s1 : C.s2,
                        border: `1px solid ${isSel ? C.gold : isBusy ? C.b1 : C.b2}`,
                        fontFamily: 'var(--font-sans)',
                        fontSize: 15,
                        fontWeight: isSel ? 700 : 500,
                        color: isSel ? '#0b0907' : isBusy ? C.cream3 : C.cream,
                        opacity: isBusy ? 0.4 : 1,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-s1/80 backdrop-blur-md border-t border-b1 z-50">
          <div className="max-w-screen-md mx-auto">
            <Btn onClick={() => nav('/confirm')} style={{ height: 56, fontSize: 16 }}>Confirmar Horário → {selTime}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
