import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Btn, Badge } from '../ui';
import { IconMoreVertical, IconPlus } from '../ui/Icons';
import { C, UPCOMING, HISTORY } from '../data/catalog';

export default function Appointments() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const list = tab === 'upcoming' ? UPCOMING : HISTORY;
  const nav = useNavigate();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">

          <div className="mb-6 sm:mb-8">
            <div className="flex items-end justify-between mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-cream">Meus Agendamentos</h1>
              <div className="hidden sm:block">
                <Btn variant="secondary" onClick={() => nav('/services')}>
                  <span className="flex items-center gap-1.5"><IconPlus size={14} /> Novo</span>
                </Btn>
              </div>
            </div>
            <div className="flex" style={{ borderBottom: `1px solid ${C.b1}` }}>
              {([['upcoming', 'Pr+¦ximos'], ['history', 'Hist+¦rico']] as const).map(([id, lbl]) => (
                <button
                  key={id}
                  className="tap flex-1 sm:flex-none sm:px-6 border-none bg-transparent py-3 font-sans text-sm transition-all duration-150 hover:bg-s2"
                  onClick={() => setTab(id)}
                  style={{
                    fontWeight: tab === id ? 600 : 400,
                    color: tab === id ? C.cream : C.cream3,
                    borderBottom: `2px solid ${tab === id ? C.gold : 'transparent'}`,
                    marginBottom: -1,
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {list.map((appt) => (
              <div
                key={appt.id}
                className="tap flex items-start gap-4 rounded-xl p-4 hover:bg-s3 transition-colors"
                style={{ background: C.s2, border: `1px solid ${C.b2}` }}
              >
                <div
                  className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg"
                  style={{ background: C.s4, border: `1px solid ${C.b2}` }}
                >
                  <span className="font-sans text-lg font-bold leading-none text-gold2">{appt.d}</span>
                  <span className="mt-0.5 font-sans text-[9px] uppercase text-cream3">{appt.mon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="mb-0.5 font-sans text-sm font-semibold text-cream truncate">{appt.svc}</p>
                  <p className="mb-2 font-sans text-xs text-cream3">{appt.barber} -À {appt.time}</p>
                  <div className="flex items-center gap-3">
                    <Badge status={appt.status} />
                    <span className="font-sans text-xs font-bold text-gold2 tabular-nums">R$ {appt.price}</span>
                  </div>
                </div>
                <button className="tap shrink-0 border-none bg-transparent p-1 text-cream3 hover:text-cream">
                  <IconMoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Btn variant="secondary" onClick={() => nav('/services')}>
              <span className="flex items-center justify-center gap-1.5"><IconPlus size={14} /> Novo Agendamento</span>
            </Btn>
          </div>
    </div>
  );
}
