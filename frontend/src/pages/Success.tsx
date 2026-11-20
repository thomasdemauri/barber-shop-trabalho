import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { Appointment } from '../api/types';
import { dateParts } from '../lib/dates';
import { formatPrice } from '../lib/format';
import { C } from '../theme';
import { Btn } from '../ui';
import { IconCheck } from '../ui/Icons';

type SuccessState = { appointment?: Appointment } | null;

export default function Success() {
  const nav = useNavigate();
  const appointment = (useLocation().state as SuccessState)?.appointment;
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowGlow(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Reached without booking (e.g. page refresh): there is nothing to summarise.
  if (!appointment) return <Navigate to="/appointments" replace />;

  const { day, month, time } = dateParts(appointment.startsAt);
  const summary = [
    ['Serviço', appointment.service.name],
    ['Data', `${day} ${month} · ${time}`],
    ['Barbeiro', appointment.barber.name],
  ];

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 flex flex-col items-center justify-center min-h-[80vh]">
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

      <div className="animate-fade-up mb-8 sm:mb-10 w-full text-center" style={{ animationDelay: '0.2s' }}>
        <div className="mb-3 font-serif text-4xl sm:text-5xl font-bold text-cream">Agendado!</div>
        <div className="font-sans text-base sm:text-lg leading-relaxed text-cream3">
          Seu pedido foi enviado ao barbeiro. Você será avisado quando ele confirmar.
        </div>
      </div>

      <div
        className="animate-fade-up mb-8 sm:mb-10 w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6"
        style={{ animationDelay: '0.35s', background: C.s2, border: `1px solid ${C.b2}` }}
      >
        <div className="flex flex-col gap-4">
          {summary.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b pb-4" style={{ borderColor: C.b1 }}>
              <span className="font-sans text-sm sm:text-base text-cream3">{label}</span>
              <span className="font-sans text-sm sm:text-base font-semibold text-cream text-right">{value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 items-center">
            <span className="font-sans text-base font-bold text-cream">Total</span>
            <span className="font-sans text-lg sm:text-xl font-bold text-gold2 tabular-nums">{formatPrice(appointment.service.price)}</span>
          </div>
        </div>
      </div>

      <div className="animate-fade-up flex w-full flex-col gap-3" style={{ animationDelay: '0.5s' }}>
        <Btn onClick={() => nav('/appointments')} style={{ height: 56, fontSize: 16 }}>Ver Meus Agendamentos</Btn>
        <Btn variant="secondary" onClick={() => nav('/home')} style={{ height: 56, fontSize: 16 }}>Voltar ao Início</Btn>
      </div>
    </div>
  );
}
