import type { Appointment } from '../../api/types';
import type { StaffDecision } from '../../contexts/appointments';
import { STATUS_COLORS, STATUS_LABEL } from '../../lib/appointment-status';
import { dateParts } from '../../lib/dates';
import { formatPrice } from '../../lib/format';
import { C } from '../../theme';
import { Btn } from '../../ui';
import { IconCheck, IconClock, IconFileText, IconScissors, IconUser, IconX } from '../../ui/Icons';

type StaffAppointmentCardProps = {
  appointment: Appointment;
  /** `date` shows day/month in the badge (dashboard); `time` shows hour/duration (daily agenda). */
  badge: 'date' | 'time';
  open: boolean;
  busy: boolean;
  now: Date;
  onToggle: () => void;
  onDecide: (decision: StaffDecision) => void;
};

export function StaffAppointmentCard({ appointment, badge, open, busy, now, onToggle, onDecide }: StaffAppointmentCardProps) {
  const { day, month, time } = dateParts(appointment.startsAt);
  const { service, client, barber, status } = appointment;
  const isPast = new Date(appointment.startsAt) < now;
  const color = STATUS_COLORS[status];
  const isOpenForDecision = status === 'pending' || status === 'confirmed';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: status === 'pending' ? C.goldBg : C.s2,
        border: `1px solid ${status === 'pending' ? `${C.gold}28` : C.b1}`,
        opacity: isPast && status !== 'pending' ? 0.6 : 1,
      }}
    >
      <button className="tap flex w-full items-center gap-4 px-5 py-4 text-left" aria-expanded={open} onClick={onToggle}>
        <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: `${C.gold}18` }}>
          <div className="font-sans text-base font-bold leading-none" style={{ color: C.gold2 }}>{badge === 'date' ? day : time}</div>
          <div className="mt-0.5 font-sans text-[9px] font-bold uppercase tracking-widest" style={{ color: `${C.gold3}aa` }}>
            {badge === 'date' ? month : `${service.durationMinutes}min`}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <div className="font-sans text-sm font-bold text-cream truncate">{service.name}</div>
            <span
              className="font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          <div className="font-sans text-xs" style={{ color: C.cream3 }}>
            {badge === 'date'
              ? <><IconClock size={11} className="inline mr-1" />{time} · {service.durationMinutes} min</>
              : <><IconUser size={11} className="inline mr-1" />{client.name}</>}
          </div>
          <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>
            <IconScissors size={11} className="inline mr-1" />{barber.name}
          </div>
          <div className="font-sans text-sm font-bold tabular-nums mt-0.5" style={{ color: C.gold2 }}>{formatPrice(service.price)}</div>
        </div>

        <span className="font-sans text-cream3 text-xl shrink-0 transition-transform duration-200" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>›</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-3" style={{ borderTop: `1px solid ${C.gold}20` }}>
          <div className="mb-2 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.cream3 }}>
            <IconFileText size={13} /> Detalhes
          </div>
          <div className="mb-4 rounded-xl p-3 font-sans text-sm space-y-1.5" style={{ background: C.s3, color: C.cream }}>
            <div className="flex items-center gap-2"><IconUser size={13} style={{ color: C.cream3 }} /> {client.name}</div>
            <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>{client.email}</div>
            {client.phone && <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>{client.phone}</div>}
            {appointment.notes && <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>“{appointment.notes}”</div>}
            <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
              <IconClock size={11} /> Criado: {new Date(appointment.createdAt).toLocaleString('pt-BR')}
            </div>
          </div>

          {isOpenForDecision && (
            <div className="flex gap-2">
              <Btn variant="danger" style={{ height: 42, fontSize: 13, flex: 1 }} disabled={busy} onClick={() => onDecide('CANCELED')}>
                <span className="flex items-center justify-center gap-1.5"><IconX size={13} /> Cancelar</span>
              </Btn>
              {status === 'pending' && (
                <Btn style={{ height: 42, fontSize: 13, flex: 1 }} loading={busy} onClick={() => onDecide('CONFIRMED')}>
                  <span className="flex items-center justify-center gap-1.5"><IconCheck size={13} /> Confirmar</span>
                </Btn>
              )}
              {status === 'confirmed' && isPast && (
                <Btn style={{ height: 42, fontSize: 13, flex: 1 }} loading={busy} onClick={() => onDecide('COMPLETED')}>
                  <span className="flex items-center justify-center gap-1.5"><IconCheck size={13} /> Concluir</span>
                </Btn>
              )}
            </div>
          )}
          {status === 'canceled' && (
            <div className="rounded-xl p-3 font-sans text-sm text-center" style={{ background: C.redBg, color: C.red, border: `1px solid ${C.red}44` }}>
              Agendamento cancelado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
