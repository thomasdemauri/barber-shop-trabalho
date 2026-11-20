import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errorMessage } from '../api/client';
import type { Appointment } from '../api/types';
import { RescheduleModal } from '../components/booking/RescheduleModal';
import { useAppointments } from '../hooks/useAppointments';
import { historyFirst, isActive, upcomingFirst } from '../lib/appointments';
import { dateParts } from '../lib/dates';
import { formatPrice } from '../lib/format';
import { C } from '../theme';
import { Btn, Badge } from '../ui';
import { IconPlus } from '../ui/Icons';

// ─── Modal de Confirmação de Cancelamento ───────────────────────────────────

function CancelModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: C.s2, border: `1px solid ${C.b2}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <span className="text-4xl">✂️</span>
          <h2 className="mt-3 font-serif text-xl font-bold text-cream">Cancelar agendamento?</h2>
          <p className="mt-2 font-sans text-sm text-cream3">
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <button
            className="tap w-full rounded-xl py-3 font-sans text-sm font-bold transition-all"
            style={{ background: C.red, color: '#fff' }}
            onClick={onConfirm}
          >
            Sim, cancelar agendamento
          </button>
          <button
            className="tap w-full rounded-xl py-3 font-sans text-sm font-semibold transition-all"
            style={{ background: C.s4, color: C.cream }}
            onClick={onClose}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function Appointments() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const { appointments, cancel } = useAppointments();
  const nav = useNavigate();

  const now = new Date();
  const list = tab === 'upcoming' ? upcomingFirst(appointments, now) : historyFirst(appointments, now);

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    setCancelId(null);
    try {
      await cancel(cancelId);
      toast.success('Agendamento cancelado.');
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível cancelar.'));
    }
  };

  return (
    <>
      {cancelId && (
        <CancelModal
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelId(null)}
        />
      )}

      {editAppt && (
        <RescheduleModal
          appointment={editAppt}
          onClose={() => setEditAppt(null)}
        />
      )}

      <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">

        <div className="mb-6 sm:mb-8">
          <div className="flex items-end justify-between mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-cream">Meus Agendamentos</h1>
            <button
              className="tap hidden sm:flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-sm font-semibold transition-all"
              onClick={() => nav('/services')}
              style={{
                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`,
                color: '#0b0907',
                boxShadow: `0 4px 16px ${C.gold}35`,
              }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.18)' }}>
                <IconPlus size={12} />
              </span>
              Novo Agendamento
            </button>
          </div>

          <div className="flex" style={{ borderBottom: `1px solid ${C.b1}` }}>
            {([['upcoming', 'Próximos'], ['history', 'Histórico']] as const).map(([id, lbl]) => (
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

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="font-sans text-5xl">✂️</span>
            <p className="font-sans text-base text-cream3">
              {tab === 'upcoming' ? 'Nenhum agendamento próximo.' : 'Nenhum histórico ainda.'}
            </p>
            {tab === 'upcoming' && (
              <button
                className="tap mt-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold"
                onClick={() => nav('/services')}
                style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}
              >
                Agendar agora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {list.map((appt) => {
              const { day: d, month: mon, time } = dateParts(appt.startsAt);
              const isFuture = isActive(appt) && new Date(appt.startsAt) >= now;

              return (
                <div
                  key={appt.id}
                  className="flex items-start gap-4 rounded-xl p-4 transition-colors"
                  style={{
                    background: C.s2,
                    border: `1px solid ${C.b2}`,
                    cursor: isFuture ? 'pointer' : 'default',
                  }}
                  onClick={() => isFuture && setEditAppt(appt)}
                >
                  {/* Data */}
                  <div
                    className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg"
                    style={{ background: C.s4, border: `1px solid ${C.b2}` }}
                  >
                    <span className="font-sans text-lg font-bold leading-none text-gold2">{d}</span>
                    <span className="mt-0.5 font-sans text-[9px] uppercase text-cream3">{mon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-sans text-sm font-semibold text-cream truncate">{appt.service.name}</p>
                      {isFuture && (
                        <span className="font-sans text-[10px] shrink-0" style={{ color: C.cream3 }}>· editar</span>
                      )}
                    </div>
                    <p className="mb-2 font-sans text-xs text-cream3">{time} · {appt.barber.name}</p>
                    <div className="flex items-center gap-3">
                      <Badge status={appt.status} />
                      <span className="font-sans text-xs font-bold text-gold2 tabular-nums">{formatPrice(appt.service.price)}</span>
                    </div>
                  </div>

                  {/* Botão X */}
                  {isFuture && (
                    <button
                      className="tap shrink-0 flex items-center justify-center h-8 w-8 rounded-full border-none font-sans text-sm font-bold transition-all hover:scale-110"
                      style={{ background: C.redBg, color: C.red, border: `1px solid ${C.red}44` }}
                      title="Cancelar agendamento"
                      onClick={e => { e.stopPropagation(); setCancelId(appt.id); }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Btn
            onClick={() => nav('/services')}
            style={{
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`,
              boxShadow: `0 4px 20px ${C.gold}35`,
            }}
          >
            <span className="flex items-center justify-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.18)' }}>
                <IconPlus size={14} />
              </span>
              <span style={{ fontWeight: 700 }}>Novo Agendamento</span>
            </span>
          </Btn>
        </div>
      </div>
    </>
  );
}