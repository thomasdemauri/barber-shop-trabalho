import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICES } from '../data/catalog';
import { useBooking } from '../contexts/BookingContext';
import { Btn, Inp } from '../components/UI_New';

export default function Services(){
  const [query, setQuery] = useState('');
  const { booking, setBooking } = useBooking();
  const nav = useNavigate();

  const filtered = SERVICES.filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Escolha o Serviço</h2>
        </div>
        <div className="mb-3">
          <Inp placeholder="Buscar serviço..." value={query} onChange={setQuery} />
        </div>

        <div className="space-y-3">
          {filtered.map(s => {
            const isSel = booking.service?.id === s.id;
            return (
              <button key={s.id} onClick={() => setBooking(b=>({...b, service: isSel? undefined : s }))}
                className={`w-full flex items-center justify-between p-3 rounded ${isSel? 'bg-yellow-400 text-black':'bg-gray-800'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{s.icon}</div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-gray-300">{s.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">R$ {s.price}</div>
                </div>
              </button>
            );
          })}
        </div>

        {booking.service && (
          <div className="mt-4">
            <Btn onClick={() => nav('/barber')}>Continuar · {booking.service.name}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
