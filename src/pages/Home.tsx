import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { SERVICES, C, getDayLabel } from '../data/catalog';
import { Btn, Badge } from '../ui';
import { IconScissors, IconCalendar, IconUser, IconZap, IconAward, IconClock } from '../ui/Icons';

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  return { d: d.getDate(), mon: months[d.getMonth()], time: iso.slice(11, 16) };
}

export default function Home() {
  const { user } = useAuth();
  const { appointments } = useAppointments();
  const nav = useNavigate();

  const now = new Date();
  const upcoming = appointments.filter(
    a => a.status !== 'canceled' && new Date(a.data_hora) >= now
  ).sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

  const nextAppt = upcoming[0];

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-sans text-sm" style={{ color: C.gold }}>Bem-vindo de volta</p>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-cream mt-1">
          {user?.nome?.split(' ')[0] || 'Cliente'}
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: IconZap, label: 'Próximos', value: String(upcoming.length), color: C.gold },
          { icon: IconAward, label: 'Serviços', value: String(SERVICES.length), color: C.gold2 },
          { icon: IconClock, label: 'Horários', value: 'Seg–Sáb', color: C.gold3 },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl p-4 sm:p-5"
            style={{ background: C.s2, border: `1px solid ${C.b2}` }}
          >
            <Icon size={22} style={{ color }} />
            <span className="font-sans text-xl font-bold text-cream">{value}</span>
            <span className="font-sans text-xs" style={{ color: C.cream3 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Next Appointment */}
      {nextAppt ? (
        <div className="rounded-xl p-5 mb-8" style={{ background: C.goldBg, border: `1px solid ${C.gold}28` }}>
          <div className="flex items-center gap-2 mb-3">
            <IconCalendar size={16} style={{ color: C.gold }} />
            <span className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
              Próximo Agendamento
            </span>
          </div>
          {(() => {
            const { d, mon, time } = formatDate(nextAppt.data_hora);
            const svc = SERVICES.find(s => String(s.id) === nextAppt.servico_id);
            return (
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg" style={{ background: C.s4, border: `1px solid ${C.b2}` }}>
                  <span className="font-sans text-lg font-bold leading-none" style={{ color: C.gold2 }}>{d}</span>
                  <span className="mt-0.5 font-sans text-[9px] uppercase" style={{ color: C.cream3 }}>{mon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-semibold text-cream truncate">{svc?.name || 'Serviço'}</p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: C.cream3 }}>{time}</p>
                </div>
                <Badge status={nextAppt.status} />
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="rounded-xl p-5 mb-8" style={{ background: C.s2, border: `1px solid ${C.b2}` }}>
          <div className="flex flex-col items-center gap-3 py-4">
            <IconCalendar size={32} style={{ color: C.cream3 }} />
            <p className="font-sans text-sm" style={{ color: C.cream3 }}>Nenhum agendamento próximo</p>
            <Btn
              onClick={() => nav('/services')}
              style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907', height: 44, borderRadius: 12 }}
            >
              Agendar agora
            </Btn>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-cream">Nossos Serviços</h2>
          <button
            className="tap font-sans text-xs font-semibold border-none bg-transparent"
            style={{ color: C.gold }}
            onClick={() => nav('/services')}
          >
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICES.slice(0, 3).map(svc => (
            <button
              key={svc.id}
              className="tap flex items-center gap-3 rounded-xl p-4 transition-all text-left"
              style={{ background: C.s2, border: `1px solid ${C.b2}` }}
              onClick={() => nav('/services')}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: C.goldBg, border: `1px solid ${C.gold}28` }}>
                <IconScissors size={18} style={{ color: C.gold }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold text-cream truncate">{svc.name}</p>
                <p className="font-sans text-xs mt-0.5" style={{ color: C.cream3 }}>{svc.desc}</p>
              </div>
              <span className="font-sans text-sm font-bold shrink-0" style={{ color: C.gold2 }}>R$ {svc.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
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
            <IconScissors size={18} style={{ color: '#0b0907' }} />
            <span style={{ fontWeight: 700, color: '#0b0907' }}>Agendar Corte</span>
          </span>
        </Btn>
        <Btn
          variant="secondary"
          onClick={() => nav('/appointments')}
          style={{ height: 52, borderRadius: 14 }}
        >
          <span className="flex items-center justify-center gap-2">
            <IconCalendar size={16} />
            Ver Agendamentos
          </span>
        </Btn>
      </div>
    </div>
  );
}
