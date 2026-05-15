import { useBooking } from '../contexts/BookingContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Btn } from '../components/UI_New';

export default function Confirm(){
  const { booking, clear } = useBooking();
  const { create } = useAppointments();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async () => {
    if (!booking.service || !booking.date || !booking.time) return;
    setLoading(true);
    const iso = `${booking.date}T${booking.time}:00`;
    const res = await create(booking.service.id, iso);
    setLoading(false);
    if (res.ok) {
      clear();
      nav('/appointments');
    } else {
      alert('Falha ao agendar: ' + (res.reason || 'erro'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-3">Confirmar Agendamento</h2>
        <div className="bg-gray-800 p-4 rounded mb-4">
          <div className="font-semibold">Serviço: {booking.service?.name}</div>
          <div className="text-sm text-gray-300">Barbeiro: {booking.barber?.name || 'Qualquer'}</div>
          <div className="text-sm text-gray-300">Data: {booking.date}</div>
          <div className="text-sm text-gray-300">Horário: {booking.time}</div>
        </div>
        <Btn onClick={handle} disabled={loading} loading={loading}>{loading? 'Agendando...':'Confirmar Agendamento'}</Btn>
      </div>
    </div>
  );
}
