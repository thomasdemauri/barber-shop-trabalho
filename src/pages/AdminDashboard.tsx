import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Btn } from '../ui';
import { C, ADMIN_TL, DOW_NAMES } from '../data/catalog';
import {
  IconScissors, IconFileText, IconCheck,
  IconMoreVertical, IconClock, IconChevronRight,
} from '../ui/Icons';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const STATS = [
  { label: 'Atendimentos', n: '8', sub: 'hoje', highlight: false },
  { label: 'Faturamento', n: 'R$ 320', sub: 'hoje', highlight: false },
  { label: 'Pendentes', n: '3', sub: 'aguardando', highlight: true },
];

const TL_DOT: Record<string, string> = {
  done: '#4a9d6e',
  next: '#d4a84c',
  upcoming: '#3c3428',
  break: '#3c3428',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [openDetail, setOpenDetail] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dateLabel = `${DOW_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`;
  const firstName = user?.nome?.split(' ')[0] || 'Admin';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">

      {/* Header */}
      <div
        className="mb-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ borderBottom: `1px solid ${C.b1}` }}
      >
        <div>
          <p
            className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium mb-2"
            style={{ color: C.cream3 }}
          >
            {greeting} · {dateLabel}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream flex items-center gap-3">
            {firstName}
            <IconScissors size={26} className="text-gold" />
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

        {/* ── Left Column ── */}
        <div className="flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ n, label, sub, highlight }) => (
              <div
                key={label}
                className="rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[100px] sm:min-h-[112px]"
                style={{
                  background: highlight ? C.goldBg : C.s2,
                  border: `1px solid ${highlight ? C.gold + '30' : C.b1}`,
                }}
              >
                <div
                  className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-snug"
                  style={{ color: highlight ? C.gold2 : C.cream3 }}
                >
                  {label}
                </div>
                <div
                  className="font-serif text-lg sm:text-2xl font-bold leading-none"
                  style={{ color: highlight ? C.gold2 : C.cream }}
                >
                  {n}
                </div>
                <div
                  className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider"
                  style={{ color: C.cream3 }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {/* Next Appointment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-sans text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: C.cream }}
              >
                Próxima Consulta
              </span>
              <span
                className="rounded-lg px-2.5 py-1 font-sans text-[11px] font-bold"
                style={{
                  background: `${C.gold}18`,
                  color: C.gold2,
                  border: `1px solid ${C.gold}28`,
                }}
              >
                em 20min
              </span>
            </div>

            <div
              className="tap rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setOpenDetail(o => !o)}
              style={{
                background: C.goldBg,
                border: `1px solid ${C.gold}2e`,
              }}
            >
              {/* Main row */}
              <div className="flex items-center gap-4 px-5 py-5">
                <div
                  className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{ background: `${C.gold}18` }}
                >
                  <div className="font-sans text-xl font-bold leading-none" style={{ color: C.gold2 }}>12</div>
                  <div className="mt-0.5 font-sans text-[9px] font-bold uppercase tracking-widest" style={{ color: C.gold3 + 'aa' }}>MAI</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm sm:text-base font-bold text-cream mb-0.5">
                    Paulo Sauro
                  </div>
                  <div className="font-sans text-xs sm:text-sm mb-1.5" style={{ color: C.cream3 }}>
                    Corte Clássico · 10:00 · 40 min
                  </div>
                  <div className="font-sans text-sm font-bold tabular-nums" style={{ color: C.gold2 }}>
                    R$ 40,00
                  </div>
                </div>
                <IconChevronRight
                  size={20}
                  className="shrink-0 transition-transform duration-200"
                  style={{ color: C.gold2, transform: openDetail ? 'rotate(90deg)' : 'none' }}
                />
              </div>

              {/* Expanded detail */}
              {openDetail && (
                <div
                  className="animate-fade-up px-5 pb-5 pt-4"
                  style={{ borderTop: `1px solid ${C.gold}20` }}
                >
                  <div
                    className="mb-2 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: C.cream3 }}
                  >
                    <IconFileText size={13} /> Observações
                  </div>
                  <p className="mb-4 font-sans text-sm leading-relaxed" style={{ color: C.cream }}>
                    Prefere tesoura. Corte baixo nas laterais, manter volume no topo.
                  </p>
                  <div className="flex gap-2">
                    <Btn variant="danger" style={{ height: 42, fontSize: 13, flex: 1 }}>
                      Cancelar
                    </Btn>
                    <Btn style={{ height: 42, fontSize: 13, flex: 1 }}>
                      <span className="flex items-center justify-center gap-1.5">
                        <IconCheck size={13} /> Concluir
                      </span>
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column — Timeline ── */}
        <div className="lg:col-span-2">
          <div
            className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: C.cream }}
          >
            Agenda de Hoje
          </div>

          <div className="flex flex-col">
            {ADMIN_TL.map((item, i) => {
              const isNext = item.status === 'next';
              const isDone = item.status === 'done';
              const isBreak = item.status === 'break';

              return (
                <div key={i} className="flex items-start gap-3 sm:gap-4">
                  {/* Time */}
                  <div
                    className="w-14 shrink-0 pt-[18px] text-right font-sans text-xs font-medium tabular-nums"
                    style={{ color: isDone ? C.cream3 : C.cream2 }}
                  >
                    {item.time}
                  </div>

                  {/* Dot + connector */}
                  <div className="flex shrink-0 flex-col items-center pt-5">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        background: TL_DOT[item.status],
                        boxShadow: isNext ? `0 0 10px ${C.gold2}70` : 'none',
                        opacity: isDone ? 0.4 : 1,
                      }}
                    />
                    {i < ADMIN_TL.length - 1 && (
                      <div
                        className="mt-1.5 w-px"
                        style={{
                          height: 52,
                          background: C.b1,
                          opacity: isDone ? 0.4 : 1,
                        }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    className="mb-2 flex-1 rounded-2xl px-4 sm:px-5 py-4 transition-colors hover:brightness-110"
                    style={{
                      background: isNext ? C.goldBg : isBreak ? C.s1 : C.s2,
                      border: `1px solid ${isNext ? C.gold + '28' : C.b1}`,
                      opacity: isDone ? 0.55 : 1,
                    }}
                  >
                    {item.client ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div
                            className="font-sans text-sm font-bold mb-0.5"
                            style={{ color: isNext ? C.gold2 : C.cream }}
                          >
                            {item.client}
                          </div>
                          <div className="font-sans text-xs" style={{ color: C.cream3 }}>
                            {item.svc}
                          </div>
                          <div className="font-sans text-[11px] mt-0.5" style={{ color: C.cream3 }}>
                            {item.dur}
                          </div>
                        </div>
                        <button
                          className="tap shrink-0 border-none bg-transparent p-1 rounded-lg transition-colors"
                          style={{ color: C.cream3 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconMoreVertical size={17} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-between gap-2 font-sans text-sm"
                        style={{ color: C.cream3 }}
                      >
                        <span className="flex items-center gap-2">
                          <IconClock size={14} />
                          {item.svc}
                        </span>
                        <span className="font-sans text-[11px]">{item.dur}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
