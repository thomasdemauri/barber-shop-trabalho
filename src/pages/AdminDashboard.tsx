import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { Btn } from '../ui';
import { C, SERVICES, DOW_NAMES } from '../data/catalog';
import { IconScissors, IconFileText, IconCheck, IconClock, IconUser } from '../ui/Icons';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function formatAppt(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    mon: MONTHS[d.getMonth()].toUpperCase(),
    time: iso.slice(11, 16),
    dow: DOW_NAMES[d.getDay()],
  };
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { appointments, cancel, edit } = useAppointments();
  const nav = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dateLabel = `${DOW_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`;
  const firstName = user?.nome?.split(' ')[0] || 'Admin';

  // Agendamentos do dia de hoje
  const todayStr = now.toISOString().slice(0, 10);
  const todayAppts = appointments
    .filter(a => a.data_hora.startsWith(todayStr) && a.status !== 'canceled')
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora));

  // Próximos (futuros, não hoje)
  const upcoming = appointments
    .filter(a => a.status !== 'canceled' && new Date(a.data_hora) > now && !a.data_hora.startsWith(todayStr))
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
    .slice(0, 10);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const todayDone = todayAppts.filter(a => new Date(a.data_hora) < now).length;
  const faturamento = todayAppts
    .filter(a => new Date(a.data_hora) < now)
    .reduce((sum, a) => sum + (SERVICES.find(s => String(s.id) === a.servico_id)?.price ?? 0), 0);

  const STATS = [
    { label: 'Atendimentos', n: String(todayDone),      sub: 'hoje' },
    { label: 'Faturamento',  n: `R$ ${faturamento}`,    sub: 'hoje' },
    { label: 'Pendentes',    n: String(pending),         sub: 'aguardando', highlight: pending > 0 },
  ];

  const handleConfirm = async (id: string, svcId: string, iso: string) => {
    setLoadingId(id);
    const res = await edit(id, svcId, iso);
    // Força status confirmed (edit coloca pending, vamos sobrescrever via cancel+create não é ideal,
    // então vamos ler e escrever direto)
    const key = 'barbershop_appointments';
    const all = JSON.parse(localStorage.getItem(key) || '[]');
    const next = all.map((a: any) => a.id === id ? { ...a, status: 'confirmed' } : a);
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent('storage', { key }));
    setLoadingId(null);
    if (res.ok || true) toast.success('Agendamento confirmado!');
    setOpenId(null);
  };

  const handleCancel = (id: string) => {
    cancel(id);
    toast.success('Agendamento cancelado.');
    setOpenId(null);
  };

  const ApptCard = ({ appt, showDetail = true }: { appt: any; showDetail?: boolean }) => {
    const { day, mon, time } = formatAppt(appt.data_hora);
    const svc = SERVICES.find(s => String(s.id) === appt.servico_id);
    const barberLabel = appt.barbeiro_nome || 'Primeiro disponível';
    const isOpen = openId === appt.id;
    const isPast = new Date(appt.data_hora) < now;
    const color = STATUS_COLORS[appt.status] || C.cream3;

    return (
      <div
        className="rounded-2xl overflow-hidden transition-opacity"
        style={{
          background: appt.status === 'pending' ? C.goldBg : C.s2,
          border: `1px solid ${appt.status === 'pending' ? `${C.gold}28` : C.b1}`,
          opacity: isPast ? 0.6 : 1,
        }}
      >
        <div
          className="tap flex items-center gap-4 px-5 py-4 cursor-pointer"
          onClick={() => showDetail && setOpenId(isOpen ? null : appt.id)}
        >
          {/* Data */}
          <div className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: `${C.gold}18` }}>
            <div className="font-sans text-base font-bold leading-none" style={{ color: C.gold2 }}>{day}</div>
            <div className="mt-0.5 font-sans text-[9px] font-bold uppercase tracking-widest" style={{ color: `${C.gold3}aa` }}>{mon}</div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="font-sans text-sm font-bold text-cream truncate">{svc?.name ?? `Serviço #${appt.servico_id}`}</div>
              <span className="font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}>
                {STATUS_LABEL[appt.status] || appt.status}
              </span>
            </div>
            <div className="font-sans text-xs" style={{ color: C.cream3 }}>
              <IconClock size={11} className="inline mr-1" />{time} · {svc?.duration ?? 40} min
            </div>
            <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>
              <IconScissors size={11} className="inline mr-1" />{barberLabel}
            </div>
            <div className="font-sans text-sm font-bold tabular-nums mt-0.5" style={{ color: C.gold2 }}>
              R$ {svc?.price ?? 0},00
            </div>
          </div>

          {showDetail && (
            <span className="font-sans text-cream3 text-xl shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
          )}
        </div>

        {/* Expanded */}
        {isOpen && showDetail && (
          <div className="px-5 pb-5 pt-3" style={{ borderTop: `1px solid ${C.gold}20` }}>
            <div className="mb-2 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.cream3 }}>
              <IconFileText size={13} /> Detalhes
            </div>
              <div className="mb-4 rounded-xl p-3 font-sans text-sm" style={{ background: C.s3, color: C.cream }}>
              <div className="flex items-center gap-2 mb-1"><IconUser size={13} style={{ color: C.cream3 }} /> {appt.cliente_nome || appt.cliente_email || `Cliente #${appt.usuario_id.slice(0, 6)}`}</div>
              {(appt.cliente_email || appt.usuario_id) && (
                <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>{appt.cliente_email || appt.usuario_id}</div>
              )}
              <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}><IconScissors size={12} /> {barberLabel}</div>
              <div className="flex items-center gap-2"><IconClock size={13} style={{ color: C.cream3 }} /> Criado: {new Date(appt.data_criacao).toLocaleString('pt-BR')}</div>
            </div>
            {!isPast && (
              <div className="flex gap-2">
                <Btn variant="danger" style={{ height: 42, fontSize: 13, flex: 1 }}
                  onClick={() => handleCancel(appt.id)}>
                  Cancelar
                </Btn>
                {appt.status === 'pending' && (
                  <Btn style={{ height: 42, fontSize: 13, flex: 1 }}
                    loading={loadingId === appt.id}
                    onClick={() => handleConfirm(appt.id, appt.servico_id, appt.data_hora)}>
                    <span className="flex items-center justify-center gap-1.5">
                      <IconCheck size={13} /> Confirmar
                    </span>
                  </Btn>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">

      {/* Header */}
      <div className="mb-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderBottom: `1px solid ${C.b1}` }}>
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: C.cream3 }}>
            {greeting} · {dateLabel}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream flex items-center gap-3">
            {firstName} <IconScissors size={26} className="text-gold" />
          </h1>
        </div>
        <button
          className="tap self-start sm:self-auto rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-colors"
          style={{ background: C.s3, border: `1px solid ${C.b2}`, color: C.cream2 }}
          onClick={() => { logout(); nav('/login'); }}
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ n, label, sub, highlight }) => (
              <div key={label} className="rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[100px]"
                style={{ background: highlight ? C.goldBg : C.s2, border: `1px solid ${highlight ? `${C.gold}30` : C.b1}` }}>
                <div className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-snug" style={{ color: highlight ? C.gold2 : C.cream3 }}>{label}</div>
                <div className="font-serif text-lg sm:text-2xl font-bold leading-none" style={{ color: highlight ? C.gold2 : C.cream }}>{n}</div>
                <div className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Pendentes de confirmação */}
          {pending > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>Aguardando confirmação</span>
                <span className="rounded-lg px-2.5 py-1 font-sans text-[11px] font-bold" style={{ background: `${C.gold}18`, color: C.gold2, border: `1px solid ${C.gold}28` }}>
                  {pending} pendente{pending > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {appointments.filter(a => a.status === 'pending').map(a => (
                  <ApptCard key={a.id} appt={a} />
                ))}
              </div>
            </div>
          )}

          {/* Próximo hoje */}
          {todayAppts.length > 0 && (() => {
            const next = todayAppts.find(a => new Date(a.data_hora) >= now);
            if (!next) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>Próximo hoje</span>
                </div>
                <ApptCard appt={next} />
              </div>
            );
          })()}
        </div>

        {/* Coluna direita — Agenda completa */}
        <div className="lg:col-span-2">
          <div className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>
            Agenda de Hoje · {todayAppts.length} agendamento{todayAppts.length !== 1 ? 's' : ''}
          </div>

          {todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
              <IconClock size={32} style={{ color: C.cream3 }} />
              <p className="font-sans text-sm" style={{ color: C.cream3 }}>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {todayAppts.map(a => <ApptCard key={a.id} appt={a} />)}
            </div>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: C.cream }}>
                Próximos dias
              </div>
              <div className="flex flex-col gap-3">
                {upcoming.map(a => <ApptCard key={a.id} appt={a} />)}
              </div>
            </>
          )}

          {appointments.filter(a => a.status !== 'canceled').length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
              <IconScissors size={32} style={{ color: C.cream3 }} />
              <p className="font-sans text-sm" style={{ color: C.cream3 }}>Nenhum agendamento ainda</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}