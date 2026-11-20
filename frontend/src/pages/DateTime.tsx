import { useNavigate } from 'react-router-dom';
import { MonthCalendar } from '../components/booking/MonthCalendar';
import { SlotGrid, SlotLegend } from '../components/booking/SlotGrid';
import { useAvailability } from '../hooks/useAvailability';
import { useBooking } from '../hooks/useBooking';
import { useWorkingWeekdays } from '../hooks/useWorkingWeekdays';
import { longDateLabel } from '../lib/dates';
import { BackBar, Btn } from '../ui';

export default function DateTime() {
  const { booking, setBooking } = useBooking();
  const nav = useNavigate();
  const barberId = booking.barber?.id;
  const { weekdays } = useWorkingWeekdays(barberId);
  const { slots, loading, error } = useAvailability({ dateKey: booking.dateKey, serviceId: booking.service?.id, barberId });

  return (
    <>
      <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 flex flex-col min-h-screen pb-40 sm:pb-24">
        <BackBar title="Data e Horário" onBack={() => nav(-1)} />

        <div className="mt-6 flex flex-col gap-8">
          <MonthCalendar
            selectedDateKey={booking.dateKey}
            workingWeekdays={weekdays}
            onSelect={dateKey => setBooking(b => ({ ...b, dateKey, slot: undefined }))}
          />

          {booking.dateKey && (
            <div className="animate-fade-up">
              <div className="mb-4 font-sans text-base sm:text-lg font-semibold text-cream">
                {longDateLabel(booking.dateKey)} — Horários
              </div>
              <SlotGrid
                slots={slots}
                loading={loading}
                error={error}
                selectedStartsAt={booking.slot?.startsAt}
                onSelect={slot => setBooking(b => ({ ...b, slot }))}
              />
              <SlotLegend />
            </div>
          )}
        </div>
      </div>

      {booking.slot && (
        <div className="fixed bottom-20 sm:bottom-0 left-0 right-0 p-4 sm:p-6 bg-s1/80 backdrop-blur-md border-t border-b1 z-50">
          <div className="max-w-screen-md mx-auto">
            <Btn onClick={() => nav('/confirm')} style={{ height: 56, fontSize: 16 }}>Confirmar Horário → {booking.slot.time}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
