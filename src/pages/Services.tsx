import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { BackBar, Btn } from '../ui';
import { IconSearch, IconX, IconCheck } from '../ui/Icons';
import { C, SERVICES } from '../data/catalog';

export default function Services() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('todos');
  const { booking, setBooking } = useBooking();
  const nav = useNavigate();
  const selected = booking.service;

  const filtered = SERVICES.filter((s) => {
    const mQ = !query || s.name.toLowerCase().includes(query.toLowerCase());
    const mC = cat === 'todos' || s.cat === cat;
    return mQ && mC;
  });

  return (
    <>
      <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 flex flex-col min-h-screen pb-24">
        <BackBar title="Escolha o Serviço" onBack={() => nav(-1 as any)} />

        {/* Search */}
        <div className="mt-4 sm:mt-6 mb-4 sm:mb-6 max-w-xl">
          <div className="flex h-10 sm:h-11 items-center gap-3 rounded-lg px-4 transition-colors focus-within:border-gold" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <IconSearch size={16} className="text-cream3 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar serviço..."
              className="flex-1 border-none bg-transparent font-sans text-sm text-cream outline-none h-full"
            />
            {query && (
              <button onClick={() => setQuery('')} className="tap border-none bg-transparent text-cream3 hover:text-cream">
                <IconX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="scroll-x flex shrink-0 gap-2 mb-6 sm:mb-8 pb-1">
          {([['todos', 'Todos'], ['corte', 'Corte'], ['combo', 'Combo'], ['barba', 'Barba'], ['trat', 'Tratamentos']] as const).map(([id, lbl]) => (
            <button
              key={id}
              className="tap shrink-0 rounded-lg px-4 py-1.5 font-sans text-sm font-medium transition-all duration-150 hover:bg-s3"
              onClick={() => setCat(id)}
              style={{
                background: cat === id ? C.gold : C.s2,
                border: `1px solid ${cat === id ? C.gold : C.b1}`,
                color: cat === id ? '#0b0907' : C.cream3,
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((svc) => {
            const isSel = selected?.id === svc.id;
            return (
              <button
                key={svc.id}
                className="tap flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 hover:bg-s3"
                onClick={() => setBooking((b: any) => ({ ...b, service: isSel ? null : svc }))}
                style={{
                  background: isSel ? C.goldBg : C.s2,
                  border: `1px solid ${isSel ? C.gold + '55' : C.b1}`,
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-serif font-bold"
                  style={{ background: isSel ? C.gold + '22' : C.s3, color: isSel ? C.gold2 : C.cream3 }}
                >
                  {svc.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="mb-0.5 font-sans text-sm font-semibold truncate" style={{ color: isSel ? C.gold2 : C.cream }}>
                    {svc.name}
                  </p>
                  <p className="font-sans text-xs text-cream3 truncate">{svc.desc}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-sans text-sm font-bold text-gold2 tabular-nums">R$ {svc.price}</span>
                  {isSel && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                      <IconCheck size={12} className="text-bg" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Continue Button */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-5 bg-s1/80 backdrop-blur-md border-t border-b1 z-50">
          <div className="max-w-lg mx-auto">
            <Btn onClick={() => nav('/barber')}>Continuar → {selected.name}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
