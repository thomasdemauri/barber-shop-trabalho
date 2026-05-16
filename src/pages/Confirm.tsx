import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { useAppointments } from '../hooks/useAppointments';
import { BackBar, Btn } from '../ui';
import { C, getDayLabel, SVC_DUR } from '../data/catalog';
import { IconCreditCard } from '../ui/Icons';

export default function Confirm() {
  const { booking, clear } = useBooking();
  const { create } = useAppointments();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const { service, barber, date, time } = booking;
  const dur = SVC_DUR[service?.id as number] || '40 min';

  const rows = [
    ['Serviço', service?.name],
    ['Barbeiro', barber?.name || 'Primeiro disponível'],
    ['Data', `${getDayLabel(Number(date))}, ${date} de Maio`],
    ['Horário', `${time} · ${dur}`],
  ];

  const handleConfirm = async () => {
    if (!service || !date || !time) return;
    setLoading(true);
    const iso = `2026-05-${String(date).padStart(2, '0')}T${time}:00`;
    const res = await create(String(service.id), iso);
    setLoading(false);
    if (res.ok) {
      clear();
      nav('/success');
    } else {
      alert('Falha ao agendar: ' + (res.reason || 'erro'));
    }
  };

  return (
    <>
      <div className="w-full max-w-screen-md mx-auto p-4 sm:p-8 lg:p-10 flex flex-col min-h-screen pb-24">
        <BackBar title="Confirmar Agendamento" onBack={() => nav(-1 as any)} />

        <div className="mt-8 flex flex-col items-center flex-1 w-full max-w-lg mx-auto">
          {/* Summary table */}
          <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl mb-8" style={{ background: C.s2, border: `1px solid ${C.b2}` }}>
            <div className="px-6 py-5 border-b border-b1 bg-s3/50 text-center">
              <span className="font-serif text-2xl font-bold text-cream">Resumo do Pedido</span>
            </div>
            <div className="flex flex-col">
              {rows.map(([k, v], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: i < rows.length - 1 ? `1px solid ${C.b1}` : 'none' }}
                >
                  <span className="font-sans text-sm sm:text-base text-cream3">{k}</span>
                  <span className="font-sans text-sm sm:text-base font-semibold text-cream text-right">{v}</span>
                </div>
              ))}
            </div>
            {/* Total */}
            <div
              className="flex items-center justify-between px-6 py-5 sm:py-6"
              style={{ background: C.goldBg, borderTop: `1px solid ${C.gold}28` }}
            >
              <span className="font-sans text-base sm:text-lg font-bold text-cream">Total</span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-gold2">R$ {service?.price},00</span>
            </div>
          </div>

          <div className="mb-8 text-center font-sans text-sm leading-relaxed text-cream3 px-4 flex items-center justify-center gap-2">
            <IconCreditCard size={16} className="shrink-0" /> Pagamento no local · Cancelamento gratuito até 2h antes
          </div>

          <div className="w-full flex flex-col gap-3">
            <Btn onClick={handleConfirm} loading={loading} style={{ height: 56, fontSize: 16 }}>
              {loading ? '' : 'Confirmar Agendamento'}
            </Btn>
            <Btn variant="secondary" onClick={() => nav(-1 as any)} style={{ height: 56, fontSize: 16 }}>Alterar Dados</Btn>
          </div>
        </div>
      </div>
    </>
  );
}
