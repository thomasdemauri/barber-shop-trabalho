import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Btn, Badge } from '../ui';
import { IconBell, IconScissors, IconAward, IconDroplet, IconZap, IconPlus } from '../ui/Icons';
import { C, UPCOMING } from '../data/catalog';

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const next = UPCOMING[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 xl:px-16">

      {/* Header */}
      <header className="flex items-end justify-between mb-6 sm:mb-8 lg:mb-10 pb-6 border-b border-b1">
        <div>
          <p className="mb-1 font-sans text-xs sm:text-sm text-cream3">Olá,</p>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream">
            {user?.nome || 'João Silva'}
          </h1>
        </div>
        <div className="relative">
          <button
            className="tap flex h-10 w-10 items-center justify-center rounded-full hover:bg-s4 transition-colors"
            style={{ background: C.s3, border: `1px solid ${C.b2}` }}
          >
            <IconBell size={18} className="text-cream" />
          </button>
          <div className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full" style={{ background: C.gold, border: `2px solid ${C.s1}` }} />
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

        {/* Promo Card */}
        <div
          className="tap relative overflow-hidden rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:scale-[1.005] transition-transform md:col-span-2"
          onClick={() => nav('/services')}
          style={{ background: `linear-gradient(135deg, ${C.s2} 0%, ${C.goldBg} 100%)`, border: `1px solid ${C.b2}` }}
        >
          <div className="absolute opacity-5" style={{ right: 50, top: -20, width: 150, height: 150, borderRadius: 75, background: C.gold }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 font-sans text-[10px] sm:text-xs uppercase tracking-[0.15em] text-gold2 font-semibold">Promoção · Hoje</p>
              <p className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-none text-cream">20% OFF</p>
              <p className="mt-2 font-sans text-xs sm:text-sm text-cream3">Corte + Barba</p>
            </div>
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl" style={{ background: C.s3, border: `1px solid ${C.b2}` }}>
              <IconScissors size={28} className="text-gold2" />
            </div>
          </div>
        </div>

        {/* CTA + Next appointment */}
        <div className="flex flex-col gap-4 md:col-span-2 xl:col-span-1">
          <Btn onClick={() => nav('/services')}>
            <span className="flex items-center justify-center gap-2"><IconPlus size={16} /> Novo Agendamento</span>
          </Btn>

          <div
            className="tap flex items-center gap-4 rounded-xl p-4 hover:bg-s3 transition-colors"
            onClick={() => nav('/appointments')}
            style={{ background: C.s2, border: `1px solid ${C.b2}` }}
          >
            <div className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg" style={{ background: C.s4, border: `1px solid ${C.b2}` }}>
              <span className="font-sans text-lg font-bold leading-none text-gold2">{next.d}</span>
              <span className="mt-0.5 font-sans text-[9px] uppercase text-cream3">{next.mon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="mb-0.5 font-sans text-sm font-semibold text-cream truncate">{next.svc}</p>
              <p className="font-sans text-xs text-cream3">{next.barber} · {next.time}</p>
            </div>
            <Badge status={next.status} />
          </div>
        </div>

        {/* Quick Services */}
        <div className="md:col-span-2 xl:col-span-3">
          <h2 className="mb-4 font-sans text-base sm:text-lg font-semibold text-cream">Serviços Rápidos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {[
              { Icon: IconScissors, name: 'Corte', price: 'R$ 40', highlight: false },
              { Icon: IconScissors, name: 'Barba', price: 'R$ 35', highlight: false },
              { Icon: IconAward, name: 'Combo', price: 'R$ 65', highlight: true },
              { Icon: IconDroplet, name: 'Relaxar', price: 'R$ 50', highlight: false },
              { Icon: IconDroplet, name: 'Hidratação', price: 'R$ 30', highlight: false },
              { Icon: IconZap, name: 'Pigmento', price: 'R$ 45', highlight: false },
            ].map((s) => (
              <button
                key={s.name}
                className="tap flex flex-col items-center gap-1.5 rounded-xl p-3 sm:p-4 hover:scale-[1.03] transition-transform"
                onClick={() => nav('/services')}
                style={{
                  background: s.highlight ? C.goldBg : C.s2,
                  border: `1px solid ${s.highlight ? C.gold + '40' : C.b1}`,
                }}
              >
                <s.Icon size={22} style={{ color: s.highlight ? C.gold2 : C.cream3 }} />
                <span className="font-sans text-[11px] sm:text-xs font-semibold" style={{ color: s.highlight ? C.gold2 : C.cream }}>{s.name}</span>
                <span className="font-sans text-[10px]" style={{ color: s.highlight ? C.gold3 + 'aa' : C.cream3 }}>{s.price}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
