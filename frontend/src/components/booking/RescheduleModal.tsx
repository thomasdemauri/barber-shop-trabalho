import { useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError, errorMessage } from '../../api/client';
import type { Appointment, Slot } from '../../api/types';
import { useAppointments } from '../../hooks/useAppointments';
import { useAvailability } from '../../hooks/useAvailability';
import { useCatalog } from '../../hooks/useCatalog';
import { useWorkingWeekdays } from '../../hooks/useWorkingWeekdays';
import { dateParts, longDateLabel } from '../../lib/dates';
import { formatPrice, serviceSummary } from '../../lib/format';
import { C } from '../../theme';
import { Btn } from '../../ui';
import { MonthCalendar } from './MonthCalendar';
import { SlotGrid } from './SlotGrid';

const SECTION_TITLE = 'font-sans text-xs font-semibold uppercase tracking-wider mb-2';

/** Lets a client change service, day and time of an appointment with the same barber. */
export function RescheduleModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const { reschedule } = useAppointments();
  const { services } = useCatalog();
  const { weekdays } = useWorkingWeekdays(appointment.barber.id);
  const current = dateParts(appointment.startsAt);

  const [serviceId, setServiceId] = useState(appointment.service.id);
  const [dateKey, setDateKey] = useState<string | undefined>(current.dateKey);
  const [slot, setSlot] = useState<Slot | undefined>();
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [saving, setSaving] = useState(false);
  const availability = useAvailability({ dateKey, serviceId, barberId: appointment.barber.id, ignoreAppointmentId: appointment.id });

  const service = services.find(s => s.id === serviceId);
  const chooseService = (id: string) => { setServiceId(id); setSlot(undefined); };
  const chooseDate = (key: string | undefined) => { setDateKey(key); setSlot(undefined); };

  const save = async () => {
    if (!slot) return;
    setSaving(true);
    try {
      await reschedule(appointment.id, { serviceId, startsAt: slot.startsAt });
      toast.success('Agendamento atualizado! Aguardando confirmação do barbeiro.');
      onClose();
    } catch (error) {
      const taken = error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE';
      toast.error(taken ? 'Horário indisponível. Escolha outro.' : errorMessage(error, 'Erro ao atualizar. Tente novamente.'));
      setStep('edit');
    } finally {
      setSaving(false);
    }
  };

  const review = [
    ['Serviço anterior', appointment.service.name],
    ['Novo serviço', service?.name ?? '-'],
    ['Nova data', dateKey ? longDateLabel(dateKey) : '-'],
    ['Novo horário', slot?.time ?? '-'],
    ['Novo valor', formatPrice(service?.price ?? 0)],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-label="Editar agendamento"
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ background: C.s1, border: `1px solid ${C.b2}`, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream">{step === 'edit' ? 'Editar Agendamento' : 'Confirmar Alterações'}</h2>
          <button aria-label="Fechar" className="tap flex h-8 w-8 items-center justify-center rounded-full font-sans text-lg font-bold"
            style={{ background: C.s3, color: C.cream3 }} onClick={onClose}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
          {step === 'edit' ? (
            <>
              <div>
                <p className={SECTION_TITLE} style={{ color: C.gold }}>Serviço</p>
                <div className="flex flex-col gap-2">
                  {services.map(s => (
                    <button key={s.id} aria-pressed={serviceId === s.id}
                      className="tap flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                      style={{ background: serviceId === s.id ? C.goldBg : C.s2, border: `1px solid ${serviceId === s.id ? C.gold : C.b2}` }}
                      onClick={() => chooseService(s.id)}>
                      <div className="text-left">
                        <p className="font-sans text-sm font-semibold text-cream">{s.name}</p>
                        <p className="font-sans text-xs text-cream3">{serviceSummary(s)}</p>
                      </div>
                      <span className="font-sans text-sm font-bold shrink-0 ml-3" style={{ color: C.gold2 }}>{formatPrice(s.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className={SECTION_TITLE} style={{ color: C.gold }}>Data</p>
                <MonthCalendar selectedDateKey={dateKey} workingWeekdays={weekdays} onSelect={chooseDate} />
              </div>

              {dateKey && (
                <div>
                  <p className={SECTION_TITLE} style={{ color: C.gold }}>Horário · {appointment.barber.name}</p>
                  <SlotGrid {...availability} selectedStartsAt={slot?.startsAt} onSelect={setSlot} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-sm text-cream3 text-center">Revise as alterações antes de confirmar:</p>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.b2}` }}>
                {review.map(([label, value], index) => (
                  <div key={label} className="flex justify-between px-4 py-3"
                    style={{ borderBottom: index < review.length - 1 ? `1px solid ${C.b1}` : 'none', background: C.s2 }}>
                    <span className="font-sans text-xs text-cream3">{label}</span>
                    <span className="font-sans text-xs font-semibold text-cream">{value}</span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-xs text-center" style={{ color: C.cream3 }}>
                ⏳ Status mudará para <strong style={{ color: C.gold2 }}>Pendente</strong> até o barbeiro confirmar.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.b1}` }}>
          {step === 'edit' ? (
            <>
              <Btn onClick={() => setStep('confirm')} disabled={!slot}
                style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}>
                Revisar alterações
              </Btn>
              <Btn variant="secondary" onClick={onClose} style={{ height: 52 }}>Cancelar</Btn>
            </>
          ) : (
            <>
              <Btn onClick={save} loading={saving}
                style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}>
                {saving ? '' : 'Confirmar alterações'}
              </Btn>
              <Btn variant="secondary" onClick={() => setStep('edit')} style={{ height: 52 }}>Voltar e editar</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
