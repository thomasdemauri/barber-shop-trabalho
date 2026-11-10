import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Btn, Badge } from '../ui';
import { IconPlus } from '../ui/Icons';
import { C, SERVICES, TIME_SLOTS, generateCalendar, DOW_NAMES, MONTH_NAMES, type CalDay } from '../data/catalog';
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment } from '../contexts/AppointmentContext';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  return { d: d.getDate(), mon: months[d.getMonth()], time: iso.slice(11, 16) };
}

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

// ─── Modal de Edição ─────────────────────────────────────────────────────────

function EditModal({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const { edit } = useAppointments();
  const svcAtual = SERVICES.find(s => String(s.id) === appt.servico_id);
  const dataAtual = new Date(appt.data_hora);
  const editYear = dataAtual.getFullYear();
  const editMonth = dataAtual.getMonth();

  const [svcId, setSvcId] = useState(appt.servico_id);
  const [day, setDay] = useState(dataAtual.getDate());
  const [time, setTime] = useState(appt.data_hora.slice(11, 16));
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [loading, setLoading] = useState(false);

  const svcSel = SERVICES.find(s => String(s.id) === svcId)!;
  const availableDays = generateCalendar(editMonth, editYear, new Date()).filter(
    (d): d is NonNullable<CalDay> => !!d && (d.available || d.d === dataAtual.getDate())
  );

  const handleSave = async () => {
    setLoading(true);
    const iso = `${editYear}-${String(editMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}:00`;
    const res = await edit(appt.id, svcId, iso);
    setLoading(false);
    if (res.ok) {
      toast.success('Agendamento atualizado! Aguardando confirmação do barbeiro.');
      onClose();
    } else if (res.reason === 'conflict') {
      toast.error('Horário indisponível. Escolha outro.');
      setStep('edit');
    } else {
      toast.error('Erro ao atualizar. Tente novamente.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ background: C.s1, border: `1px solid ${C.b2}`, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream">
            {step === 'edit' ? 'Editar Agendamento' : 'Confirmar Alterações'}
          </h2>
          <button
            className="tap flex h-8 w-8 items-center justify-center rounded-full font-sans text-lg font-bold transition-colors"
            style={{ background: C.s3, color: C.cream3 }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
          {step === 'edit' ? (
            <>
              {/* Serviço */}
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.gold }}>Serviço</p>
                <div className="flex flex-col gap-2">
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      className="tap flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                      style={{
                        background: svcId === String(s.id) ? C.goldBg : C.s2,
                        border: `1px solid ${svcId === String(s.id) ? C.gold : C.b2}`,
                      }}
                      onClick={() => setSvcId(String(s.id))}
                    >
                      <div className="text-left">
                        <p className="font-sans text-sm font-semibold text-cream">{s.name}</p>
                        <p className="font-sans text-xs text-cream3">{s.desc}</p>
                      </div>
                      <span className="font-sans text-sm font-bold shrink-0 ml-3" style={{ color: C.gold2 }}>R$ {s.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dia */}
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.gold }}>Data</p>
                <div className="grid grid-cols-4 gap-2">
                  {availableDays.map(cd => (
                    <button
                      key={cd.d}
                      className="tap flex flex-col items-center rounded-xl py-2.5 transition-all"
                      style={{
                        background: day === cd.d ? C.gold : C.s2,
                        border: `1px solid ${day === cd.d ? C.gold : C.b2}`,
                      }}
                      onClick={() => setDay(cd.d)}
                    >
                      <span className="font-sans text-[10px] uppercase" style={{ color: day === cd.d ? '#0b0907' : C.cream3 }}>
                        {DOW_NAMES[cd.dow]}
                      </span>
                      <span className="font-sans text-base font-bold" style={{ color: day === cd.d ? '#0b0907' : C.cream }}>
                        {cd.d}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Horário */}
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.gold }}>Horário</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      className="tap rounded-xl py-2.5 font-sans text-sm font-semibold transition-all"
                      style={{
                        background: time === t ? C.gold : C.s2,
                        border: `1px solid ${time === t ? C.gold : C.b2}`,
                        color: time === t ? '#0b0907' : C.cream,
                      }}
                      onClick={() => setTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Tela de confirmação */
            <div className="flex flex-col gap-4">
              <p className="font-sans text-sm text-cream3 text-center">Revise as alterações antes de confirmar:</p>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.b2}` }}>
                {[
                  ['Serviço anterior', svcAtual?.name ?? '-'],
                  ['Novo serviço', svcSel?.name ?? '-'],
                  ['Nova data', `${DOW_NAMES[new Date(editYear, editMonth, day).getDay()]}, ${day} de ${MONTH_NAMES[editMonth]}`],
                  ['Novo horário', time],
                  ['Novo valor', `R$ ${svcSel?.price ?? 0},00`],
                ].map(([k, v], i, arr) => (
                  <div
                    key={k}
                    className="flex justify-between px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.b1}` : 'none', background: C.s2 }}
                  >
                    <span className="font-sans text-xs text-cream3">{k}</span>
                    <span className="font-sans text-xs font-semibold text-cream">{v}</span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-xs text-center" style={{ color: C.cream3 }}>
                ⏳ Status mudará para <strong style={{ color: C.gold2 }}>Pendente</strong> até o barbeiro confirmar.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.b1}` }}>
          {step === 'edit' ? (
            <>
              <Btn
                onClick={() => setStep('confirm')}
                style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}
              >
                Revisar alterações
              </Btn>
              <Btn variant="secondary" onClick={onClose} style={{ height: 52 }}>Cancelar</Btn>
            </>
          ) : (
            <>
              <Btn
                onClick={handleSave}
                loading={loading}
                style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}
              >
                {loading ? '' : 'Confirmar alterações'}
              </Btn>
              <Btn variant="secondary" onClick={() => setStep('edit')} style={{ height: 52 }}>Voltar e editar</Btn>
            </>
          )}
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
  const { user } = useAuth();
  const nav = useNavigate();

  const myAppointments = user?.tipo === 'barbeiro'
    ? appointments
    : appointments.filter(a => a.usuario_id === user?.id);

  const now = new Date();
  const upcoming = myAppointments.filter(a => a.status !== 'canceled' && new Date(a.data_hora) >= now);
  const history  = myAppointments.filter(a => a.status === 'canceled'  || new Date(a.data_hora) < now);
  const list = tab === 'upcoming' ? upcoming : history;

  const handleConfirmCancel = () => {
    if (cancelId) {
      cancel(cancelId);
      toast.success('Agendamento cancelado.');
    }
    setCancelId(null);
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
        <EditModal
          appt={editAppt}
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
              const { d, mon, time } = formatDate(appt.data_hora);
              const svc = SERVICES.find(s => String(s.id) === appt.servico_id);
              const svcName = svc?.name ?? `Serviço #${appt.servico_id}`;
              const price = svc?.price ?? 0;
              const isFuture = appt.status !== 'canceled' && new Date(appt.data_hora) >= now;

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
                      <p className="font-sans text-sm font-semibold text-cream truncate">{svcName}</p>
                      {isFuture && (
                        <span className="font-sans text-[10px] shrink-0" style={{ color: C.cream3 }}>· editar</span>
                      )}
                    </div>
                    <p className="mb-2 font-sans text-xs text-cream3">· {time}</p>
                    <div className="flex items-center gap-3">
                      <Badge status={appt.status} />
                      <span className="font-sans text-xs font-bold text-gold2 tabular-nums">R$ {price},00</span>
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