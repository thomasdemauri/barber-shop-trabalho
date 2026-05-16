import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Btn } from '../ui';
import { C, UPCOMING } from '../data/catalog';
import { IconCheck } from '../ui/Icons';

export default function Success() {
  const nav = useNavigate();
  const [showGlow, setShowGlow] = useState(false);
  const appt = UPCOMING[0];

  useEffect(() => {
    const t = setTimeout(() => setShowGlow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="w-full max-w-md mx-auto p-6 sm:p-12 flex flex-col items-center justify-center min-h-[80vh]">
          {/* Success circle */}
          <div
            className={`animate-scale-in ${showGlow ? 'animate-glow-ring' : ''} mb-8 sm:mb-10 flex items-center justify-center rounded-full`}
            style={{
              width: 100,
              height: 100,
              background: `radial-gradient(circle at 35% 35%, ${C.s3}, ${C.s1})`,
              border: `4px solid ${C.gold}`,
            }}
          >
            <IconCheck size={48} className="text-gold" />
          </div>

          {/* Text */}
          <div className="animate-fade-up mb-8 sm:mb-10 w-full text-center" style={{ animationDelay: '0.2s' }}>
            <div className="mb-3 font-serif text-4xl sm:text-5xl font-bold text-cream">Agendado!</div>
            <div className="font-sans text-base sm:text-lg leading-relaxed text-cream3">
              Confirma+º+úo enviada por SMS e e-mail. At+® l+í! ­ƒæï
            </div>
          </div>

          {/* Summary card */}
          <div
            className="animate-fade-up mb-8 sm:mb-10 w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6"
            style={{ animationDelay: '0.35s', background: C.s2, border: `1px solid ${C.b2}` }}
          >
            <div className="flex flex-col gap-4">
              {[
                ['Servi+ºo', appt.svc],
                ['Data', `${appt.d} ${appt.mon} -À ${appt.time}`],
                ['Barbeiro', appt.barber],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b pb-4" style={{ borderColor: C.b1 }}>
                  <span className="font-sans text-sm sm:text-base text-cream3">{k}</span>
                  <span className="font-sans text-sm sm:text-base font-semibold text-cream text-right">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 items-center">
                <span className="font-sans text-base font-bold text-cream">Total</span>
                <span className="font-sans text-lg sm:text-xl font-bold text-gold2 tabular-nums">R$ {appt.price},00</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="animate-fade-up flex w-full flex-col gap-3" style={{ animationDelay: '0.5s' }}>
            <Btn onClick={() => nav('/appointments')} style={{ height: 56, fontSize: 16 }}>Ver Meus Agendamentos</Btn>
            <Btn variant="secondary" onClick={() => nav('/home')} style={{ height: 56, fontSize: 16 }}>Voltar ao In+¡cio</Btn>
          </div>
      </div>
    </>
  );
}
