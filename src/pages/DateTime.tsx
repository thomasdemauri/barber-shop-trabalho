import { useState } from 'react';
import { TIME_SLOTS } from '../data/catalog';
import { useBooking } from '../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import { Btn, Inp } from '../components/UI_New';

export default function DateTime(){
  const { booking, setBooking } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-15');
  const [selectedTime, setSelectedTime] = useState<string | undefined>(booking.time);
  const nav = useNavigate();

  const choose = (t: string) => {
    setSelectedTime(t === selectedTime ? undefined : t);
    setBooking(b=>({...b, date: selectedDate, time: t}));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-3">Data e Horário</h2>
        <Inp type="date" value={selectedDate} onChange={setSelectedDate} />

        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map(t => (
            <Btn key={t} onClick={() => choose(t)} variant={selectedTime===t? 'primary':'secondary'} size="sm">{t}</Btn>
          ))}
        </div>

        {selectedDate && selectedTime && (
          <div className="mt-4">
            <Btn onClick={()=>nav('/confirm')}>Confirmar · {selectedTime}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
