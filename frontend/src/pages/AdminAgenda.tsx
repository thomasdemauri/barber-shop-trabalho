import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppointments } from '../hooks/useAppointments';
import { Btn } from '../ui';
import { C, SERVICES, DOW_NAMES } from '../data/catalog';
import { IconChevronLeft, IconChevronRight, IconClock, IconCheck, IconUser, IconFileText, IconCalendar, IconX, IconScissors } from '../ui/Icons';
import { api } from '../services/api';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function getUsers() {
  try { return JSON.parse(localStorage.getItem('barbershop_users') || '[]'); } catch { return []; }
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#4a9d6e',
  pending:   '#d4a84c',
  canceled:  '#c05050',
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmado',
  pending:   'Pendente',
  canceled:  'Cancelado',
};

type Filter = 'all' | 'pending' | 'confirmed' | 'canceled';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'canceled', label: 'Cancelados' },
];

export default function AdminAgenda() {
  const { appointments, cancel } = useAppointments();
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const users = useMemo(() => getUsers(), []);
  const userMap = useMemo(() => {
    const m = new Map<string, any>();
    users.forEach((u: any) => m.set(u.id, u));
    return m;
  }, [users]);

  const dayStr = baseDate.toISOString().slice(0, 10);

  const dayAppts = useMemo(() => {
    return appointments
      .filter(a => a.data_hora.startsWith(dayStr))
      .sort((a, b) => a.data_hora.localeCompare(b.data_hora));
  }, [appointments, dayStr]);

  const filtered = useMemo(() => {
    if (filter === 'all') return dayAppts;
    return dayAppts.filter(a => a.status === filter);
  }, [dayAppts, filter]);

  const pendingCount = dayAppts.filter(a => a.status === 'pending').length;
  const confirmedCount = dayAppts.filter(a => a.status === 'confirmed').length;

  function goDay(delta: number) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + delta);
    setBaseDate(d);
    setOpenId(null);
  }

  function goToday() {
    setBaseDate(new Date());
    setOpenId(null);
  }

  const isToday = dayStr === new Date().toISOString().slice(0, 10);

  const handleConfirm = async (id: string) => {
    setLoadingId(id);
    await api(`/admin/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED' }) });
    setLoadingId(null);
    toast.success('Agendamento confirmado!');
    setOpenId(null);
  };

  const handleCancel = (id: string) => {
    cancel(id);
    toast.success('Agendamento cancelado.');
    setOpenId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream flex items-center gap-3">
          <IconCalendar size={24} className="text-gold" /> Agenda
        </h1>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-6 rounded-2xl p-3" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
        <button className="tap flex items-center gap-1 rounded-xl px-3 py-2 font-sans text-sm font-medium transition-colors hover:bg-s3" style={{ color: C.cream2 }}
          onClick={() => goDay(-1)}>
          <IconChevronLeft size={16} /> Anterior
        </button>

        <div className="flex items-center gap-3">
          <span className="font-sans text-sm font-semibold text-cream">
            {DOW_NAMES[baseDate.getDay()]}, {baseDate.getDate()} de {MONTHS[baseDate.getMonth()]}
          </span>
          {!isToday && (
            <button className="tap rounded-lg px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ background: C.goldBg, color: C.gold2, border: `1px solid ${C.gold}28` }}
              onClick={goToday}>
              Hoje
            </button>
          )}
        </div>

        <button className="tap flex items-center gap-1 rounded-xl px-3 py-2 font-sans text-sm font-medium transition-colors hover:bg-s3" style={{ color: C.cream2 }}
          onClick={() => goDay(1)}>
          Próximo <IconChevronRight size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto scroll-x">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const count = key === 'all' ? dayAppts.length
            : key === 'pending' ? pendingCount
            : key === 'confirmed' ? confirmedCount
            : dayAppts.filter(a => a.status === 'canceled').length;
          return (
            <button key={key}
              className="tap shrink-0 rounded-xl px-4 py-2 font-sans text-[12px] font-semibold transition-all"
              style={{
                background: active ? C.gold : 'transparent',
                color: active ? C.bg : C.cream2,
                border: `1px solid ${active ? C.gold : C.b1}`,
              }}
              onClick={() => { setFilter(key); setOpenId(null); }}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Agenda list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <IconCalendar size={32} style={{ color: C.cream3 }} />
            <p className="font-sans text-sm" style={{ color: C.cream3 }}>
              {filter === 'all' ? 'Nenhum agendamento neste dia' : `Nenhum agendamento ${STATUS_LABEL[filter]?.toLowerCase() || filter} neste dia`}
            </p>
          </div>
        ) : (
          filtered.map(appt => {
            const svc = SERVICES.find(s => String(s.id) === appt.servico_id);
            const userData = userMap.get(appt.usuario_id);
            const clientLabel = userData?.nome || appt.cliente_nome || userData?.email || appt.cliente_email || `Cliente #${appt.usuario_id.slice(0, 6)}`;
            const barberLabel = appt.barbeiro_nome || 'Primeiro disponível';
            const time = appt.data_hora.slice(11, 16);
            const isOpen = openId === appt.id;
            const isPast = new Date(appt.data_hora) < new Date();
            const color = STATUS_COLORS[appt.status] || C.cream3;

            return (
              <div key={appt.id} className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: appt.status === 'pending' ? C.goldBg : C.s2,
                  border: `1px solid ${appt.status === 'pending' ? `${C.gold}28` : C.b1}`,
                  opacity: isPast && appt.status !== 'pending' ? 0.5 : 1,
                }}>
                <div className="tap flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setOpenId(isOpen ? null : appt.id)}>

                  {/* Time */}
                  <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: `${C.gold}18` }}>
                    <div className="font-sans text-base font-bold leading-none" style={{ color: C.gold2 }}>{time}</div>
                    <div className="mt-0.5 font-sans text-[9px] font-bold uppercase tracking-widest" style={{ color: `${C.gold3}aa` }}>{svc?.duration ?? 40}min</div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <div className="font-sans text-sm font-bold text-cream truncate">{svc?.name ?? `Serviço #${appt.servico_id}`}</div>
                      <span className="font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}>
                        {STATUS_LABEL[appt.status] || appt.status}
                      </span>
                    </div>
                    <div className="font-sans text-xs" style={{ color: C.cream3 }}>
                      <IconUser size={11} className="inline mr-1" />{clientLabel}
                    </div>
                    <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>
                      <IconScissors size={11} className="inline mr-1" />{barberLabel}
                    </div>
                    <div className="font-sans text-sm font-bold tabular-nums mt-0.5" style={{ color: C.gold2 }}>
                      R$ {svc?.price ?? 0},00
                    </div>
                  </div>

                  <span className="font-sans text-cream3 text-xl shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3" style={{ borderTop: `1px solid ${C.gold}20` }}>
                    <div className="mb-2 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.cream3 }}>
                      <IconFileText size={13} /> Detalhes
                    </div>
                    <div className="mb-4 rounded-xl p-3 font-sans text-sm space-y-1.5" style={{ background: C.s3, color: C.cream }}>
                      <div className="flex items-center gap-2"><IconUser size={13} style={{ color: C.cream3 }} /> {clientLabel}</div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}><IconScissors size={12} /> {barberLabel}</div>
                      {(userData?.email || appt.cliente_email) && <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>{userData?.email || appt.cliente_email}</div>}
                      {userData?.telefone && <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>{userData.telefone}</div>}
                      <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
                        <IconClock size={11} /> Criado: {new Date(appt.data_criacao).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    {!isPast && appt.status !== 'canceled' && (
                      <div className="flex gap-2">
                        <Btn variant="danger" style={{ height: 42, fontSize: 13, flex: 1 }}
                          onClick={() => handleCancel(appt.id)}>
                          <span className="flex items-center justify-center gap-1.5">
                            <IconX size={13} /> Cancelar
                          </span>
                        </Btn>
                        {appt.status === 'pending' && (
                          <Btn style={{ height: 42, fontSize: 13, flex: 1 }}
                            loading={loadingId === appt.id}
                            onClick={() => handleConfirm(appt.id)}>
                            <span className="flex items-center justify-center gap-1.5">
                              <IconCheck size={13} /> Confirmar
                            </span>
                          </Btn>
                        )}
                      </div>
                    )}
                    {appt.status === 'canceled' && (
                      <div className="rounded-xl p-3 font-sans text-sm text-center" style={{ background: C.redBg, color: C.red, border: `1px solid ${C.red}44` }}>
                        Agendamento cancelado
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {dayAppts.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-6 rounded-2xl p-4" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <div className="text-center">
            <div className="font-serif text-lg font-bold" style={{ color: C.gold2 }}>{dayAppts.length}</div>
            <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>Total</div>
          </div>
          <div className="w-px h-8" style={{ background: C.b1 }} />
          <div className="text-center">
            <div className="font-serif text-lg font-bold" style={{ color: '#4a9d6e' }}>{confirmedCount}</div>
            <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>Confirmados</div>
          </div>
          <div className="w-px h-8" style={{ background: C.b1 }} />
          <div className="text-center">
            <div className="font-serif text-lg font-bold" style={{ color: '#d4a84c' }}>{pendingCount}</div>
            <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>Pendentes</div>
          </div>
        </div>
      )}
    </div>
  );
}
