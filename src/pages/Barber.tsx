import { useNavigate } from 'react-router-dom';
import { BARBERS } from '../data/catalog';
import { useBooking } from '../contexts/BookingContext';
import { useState } from 'react';
import { Btn } from '../components/UI_New';

export default function Barber(){
  const { booking, setBooking } = useBooking();
  const [noPref, setNoPref] = useState(false);
  const nav = useNavigate();
  const selected = booking.barber;

  const canContinue = selected || noPref;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-3">Escolha o Barbeiro</h2>
        <div className="space-y-3 mb-4">
          {BARBERS.map(b => {
            const isSel = selected?.id === b.id;
            return (
              <Btn key={b.id} onClick={() => { setNoPref(false); setBooking(cur=>({...cur, barber: isSel? undefined : b })); }} variant={isSel? 'primary':'secondary'}>
                <div className="flex items-center gap-3 w-full">
                  <div className="text-2xl">{b.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-sm text-gray-300">{b.specialty}</div>
                  </div>
                  <div className="text-sm text-gray-300">{'★'.repeat(Math.round(b.rating))}</div>
                </div>
              </Btn>
            );
          })}
        </div>

        <button onClick={() => { setNoPref(p=>!p); setBooking(b=>({...b, barber: undefined})); }} className={`w-full p-3 rounded mb-4 ${noPref? 'bg-yellow-400 text-black':'bg-gray-800'}`}>
          Sem preferência (1º disponível)
        </button>

        {canContinue && <button onClick={()=>nav('/datetime')} className="w-full py-3 rounded bg-yellow-400 text-black font-semibold">Escolher Horário</button>}
      </div>
    </div>
  );
}
