import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Btn, Badge } from '../ui';
import {
  IconBell, IconScissors, IconAward, IconDroplet, IconZap,
  IconPlus, IconChevronRight, IconStar,
} from '../ui/Icons';
import { C, UPCOMING, BARBERS } from '../data/catalog';

const QUICK_SERVICES = [
  { Icon: IconScissors, name: 'Corte', price: 'R$ 40', highlight: false },
  { Icon: IconScissors, name: 'Barba', price: 'R$ 35', highlight: false },
  { Icon: IconAward, name: 'Combo', price: 'R$ 65', highlight: true },
  { Icon: IconDroplet, name: 'Relaxar', price: 'R$ 50', highlight: false },
  { Icon: IconDroplet, name: 'Hidratação', price: 'R$ 30', highlight: false },
  { Icon: IconZap, name: 'Pigmento', price: 'R$ 45', highlight: false },
];

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const next = UPCOMING[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.nome?.split(' ')[0] || 'Bem-vindo';

  return (
    <div className="w-full max-w-8xl mx-auto px-6 sm:px-10 lg:px-14 py-8 sm:py-10 lg:py-12">

      {/* Header */}
      <header className="flex items-center justify-between mb-8 sm:mb-10">
        <div>
          <p
            className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-1.5"
            style={{ color: C.cream3 }}
          >
            {greeting}
          </p>
          <h1
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-none"
            style={{ color: C.cream }}
          >
            {firstName}
          </h1>
        </div>

        <button
          className="tap relative flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          style={{ background: C.s2, border: `1px solid ${C.b2}` }}
        >
          <IconBell size={19} style={{ color: C.cream2 }} />
          <span
            className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
            style={{ background: C.gold, border: `2px solid ${C.bg}` }}
          />
        </button>
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

        {/* ── Promo Banner ── */}
        <div
          className="tap relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 cursor-pointer group lg:col-span-2"
          onClick={() => nav('/services')}
          style={{
            background: `linear-gradient(140deg, ${C.s3} 0%, ${C.goldBg} 55%, #261807 100%)`,
            border: `1px solid ${C.b2}`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 w-52 h-52 rounded-full"
            style={{ background: `radial-gradient(circle, ${C.gold}30 0%, transparent 70%)` }}
          />
          <div
            className="pointer-events-none absolute right-14 bottom-0 w-32 h-32 rounded-full"
            style={{ background: `radial-gradient(circle, ${C.gold3}14 0%, transparent 70%)` }}
          />

          <div className="relative z-10 flex items-end justify-between gap-4">
            <div>
              <span
                className="inline-block font-sans text-[10px] uppercase tracking-[0.22em] font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: `${C.gold}1a`, color: C.gold2, border: `1px solid ${C.gold}28` }}
              >
                Promoção · Hoje
              </span>
              <p
                className="font-serif font-bold leading-none mb-2.5"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', color: C.cream }}
              >
                20% OFF
              </p>
              <p className="font-sans text-sm sm:text-base" style={{ color: C.cream2 }}>
                Corte + Barba — combo premium
              </p>
            </div>

            <div
              className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-300"
              style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}30` }}
            >
              <IconScissors size={32} style={{ color: C.gold2 }} />
            </div>
          </div>
        </div>

        {/* ── CTA + Next Appointment ── */}
        <div className="flex flex-col gap-4">
          <Btn
            onClick={() => nav('/services')}
            style={{
              height: 64,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`,
              boxShadow: `0 4px 24px ${C.gold}40, 0 1px 0 rgba(255,255,255,0.12) inset`,
              fontSize: 15,
              letterSpacing: '0.02em',
            }}
          >
            <span className="flex items-center justify-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: 'rgba(0,0,0,0.18)' }}
              >
                <IconPlus size={15} />
              </span>
              <span style={{ fontWeight: 700 }}>Novo Agendamento</span>
            </span>
          </Btn>

          <div
            className="tap flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-colors"
            onClick={() => nav('/appointments')}
            style={{ background: C.s2, border: `1px solid ${C.b2}` }}
          >
            <div
              className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
              style={{ background: C.s4, border: `1px solid ${C.b2}` }}
            >
              <span
                className="font-sans text-xl font-bold leading-none"
                style={{ color: C.gold2 }}
              >
                {next.d}
              </span>
              <span
                className="font-sans text-[9px] uppercase tracking-wide mt-0.5"
                style={{ color: C.cream3 }}
              >
                {next.mon}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-sans text-sm font-semibold truncate mb-0.5"
                style={{ color: C.cream }}
              >
                {next.svc}
              </p>
              <p className="font-sans text-xs" style={{ color: C.cream3 }}>
                {next.barber} · {next.time}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge status={next.status} />
              <IconChevronRight size={14} style={{ color: C.cream3 }} />
            </div>
          </div>
        </div>

        {/* ── Quick Services ── */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: C.cream }}
            >
              Serviços
            </h2>
            <button
              className="tap font-sans text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: C.gold2 }}
              onClick={() => nav('/services')}
            >
              Ver todos →
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {QUICK_SERVICES.map((s) => (
              <button
                key={s.name}
                className="tap flex flex-col items-center gap-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:scale-[1.03] active:scale-[0.97] transition-transform"
                onClick={() => nav('/services')}
                style={{
                  background: s.highlight ? C.goldBg : C.s2,
                  border: `1px solid ${s.highlight ? `${C.gold}44` : C.b1}`,
                }}
              >
                <s.Icon size={22} style={{ color: s.highlight ? C.gold2 : C.cream3 }} />
                <span
                  className="font-sans text-[11px] sm:text-xs font-semibold leading-tight text-center"
                  style={{ color: s.highlight ? C.gold2 : C.cream }}
                >
                  {s.name}
                </span>
                <span
                  className="font-sans text-[10px]"
                  style={{ color: s.highlight ? `${C.gold3}bb` : C.cream3 }}
                >
                  {s.price}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Barbers ── */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: C.cream }}
            >
              Nossos Barbeiros
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {BARBERS.map((b) => (
              <div
                key={b.id}
                className="tap flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-colors"
                onClick={() => nav('/barber')}
                style={{ background: C.s2, border: `1px solid ${C.b2}` }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold"
                  style={{
                    background: C.goldBg,
                    border: `1px solid ${C.gold}2e`,
                    color: C.gold2,
                  }}
                >
                  {b.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-sans text-sm font-semibold truncate mb-0.5"
                    style={{ color: C.cream }}
                  >
                    {b.name}
                  </p>
                  <p
                    className="font-sans text-[11px] truncate mb-1.5"
                    style={{ color: C.cream3 }}
                  >
                    {b.specialty}
                  </p>
                  <div className="flex items-center gap-1">
                    <IconStar size={11} style={{ color: C.gold }} />
                    <span
                      className="font-sans text-[11px] font-semibold"
                      style={{ color: C.gold2 }}
                    >
                      {b.rating}
                    </span>
                    <span className="font-sans text-[10px]" style={{ color: C.cream3 }}>
                      ({b.reviews})
                    </span>
                  </div>
                </div>

                <IconChevronRight size={16} style={{ color: C.cream3 }} className="shrink-0" />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
