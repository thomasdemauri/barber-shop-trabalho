import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { BackBar, Btn, Stars } from '../ui';
import { C, BARBERS } from '../data/catalog';
import { IconCheck } from '../ui/Icons';

export default function Barber() {
  const { booking, setBooking } = useBooking();
  const [noPref, setNoPref] = useState(false);
  const nav = useNavigate();
  const selected = booking.barber;
  const canContinue = selected || noPref;

  return (
    <>
      <div className="w-full max-w-screen-md mx-auto p-4 sm:p-8 lg:p-10 flex flex-col min-h-screen pb-24">
        <BackBar title="Escolha o Barbeiro" onBack={() => nav(-1 as any)} />

        <div className="mt-6 flex flex-col">
          {/* Service context */}
          <div
            className="mb-8 inline-flex items-center self-start gap-2 sm:gap-3 rounded-xl px-4 py-2"
            style={{ background: C.s2, border: `1px solid ${C.b1}` }}
          >
            <span className="text-lg">{booking.service?.icon}</span>
            <span className="font-sans text-sm sm:text-base font-medium text-cream">{booking.service?.name}</span>
            <span style={{ color: C.b2 }}>·</span>
            <span className="font-sans text-sm sm:text-base font-bold text-gold2 tabular-nums">R$ {booking.service?.price}</span>
          </div>

          <div className="mb-6 font-sans text-lg sm:text-xl font-semibold text-cream">Profissionais Disponíveis</div>

          {/* Barber cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {BARBERS.map((b) => {
              const isSel = selected?.id === b.id;
              return (
                <button
                  key={b.id}
                  className="tap flex flex-col items-center gap-2 sm:gap-3 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:bg-s3"
                  onClick={() => { setNoPref(false); setBooking((bk: any) => ({ ...bk, barber: isSel ? null : b })); }}
                  style={{
                    background: isSel ? C.goldBg : C.s2,
                    border: `1.5px solid ${isSel ? C.gold : C.b1}`,
                  }}
                >
                  <div
                    className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-3xl sm:text-4xl transition-all duration-200"
                    style={{ background: C.s3, border: `2px solid ${isSel ? C.gold : C.b2}` }}
                  >
                    {b.icon}
                  </div>
                  <div className="text-center font-sans text-sm font-semibold truncate w-full" style={{ color: isSel ? C.gold2 : C.cream }}>
                    {b.name.split(' ')[0]}
                  </div>
                  <Stars rating={b.rating} size={12} />
                </button>
              );
            })}
          </div>

          {/* No preference */}
          <button
            className="tap mb-8 flex w-full items-center gap-4 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:bg-s3"
            onClick={() => { setNoPref((p) => !p); setBooking((b: any) => ({ ...b, barber: null })); }}
            style={{
              background: noPref ? C.s3 : C.s2,
              border: `1px solid ${noPref ? C.gold : C.b1}`,
            }}
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200"
              style={{
                border: `2px solid ${noPref ? C.gold : C.b2}`,
                background: noPref ? C.gold : 'transparent',
              }}
            >
              {noPref && <IconCheck size={12} className="text-bg" />}
            </div>
            <span className="font-sans text-sm sm:text-base font-medium text-cream">Sem preferência (Primeiro disponível)</span>
          </button>

          {/* Selected barber detail */}
          {selected && (
            <div className="animate-fade-up rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b2}` }}>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-3xl sm:text-4xl" style={{ background: C.s3, border: `2px solid ${C.gold}44` }}>
                  {selected.icon}
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-cream">{selected.name}</div>
                  <div className="font-sans text-xs sm:text-sm text-cream3 mt-1">{selected.exp} de experiência</div>
                </div>
              </div>
              <div className="mb-4 font-sans text-sm sm:text-base leading-relaxed text-cream">{selected.specialty}</div>
              <div className="flex items-center justify-between border-t border-b1 pt-4">
                <Stars rating={selected.rating} size={16} />
                <span className="font-sans text-xs sm:text-sm text-cream3 font-medium">{selected.rating} · {selected.reviews} avaliações</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {canContinue && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-s1/80 backdrop-blur-md border-t border-b1 z-50">
          <div className="max-w-screen-md mx-auto">
            <Btn onClick={() => nav('/datetime')} style={{ height: 56, fontSize: 16 }}>Escolher Horário</Btn>
          </div>
        </div>
      )}
    </>
  );
}
