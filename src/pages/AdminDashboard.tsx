import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Btn } from '../ui';
import { C, ADMIN_TL } from '../data/catalog';
import { IconScissors, IconFileText, IconCheck, IconMoreVertical, IconClock } from '../ui/Icons';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [openDetail, setOpenDetail] = useState(false);

  const tlDotColor: Record<string, string> = {
    done: C.green,
    next: C.gold2,
    upcoming: C.b2,
    break: C.b2,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-b1 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="mb-2 font-sans text-xs sm:text-sm tracking-[0.05em] text-cream3 uppercase">
            Ter, 12 de Maio · 09:41
          </div>
          <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream">
            Olá, {user?.nome?.split(' ')[0] || 'João'} <IconScissors size={28} className="text-gold inline-block mb-1" />
          </div>
        </div>
        <button
          className="tap self-start sm:self-auto rounded-xl border px-5 py-2 font-sans text-sm font-semibold text-cream hover:bg-s4 transition-colors"
          style={{ background: C.s3, borderColor: C.b2 }}
          onClick={() => { logout(); nav('/login'); }}
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats and Next Appointment */}
        <div className="flex flex-col gap-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              ['8', 'Hoje', false],
              ['R$\n320', 'Faturamento', false],
              ['3', 'Pendentes', true],
            ].map(([n, l, h], i) => (
              <div
                key={i}
                className="rounded-2xl p-4 text-center sm:text-left flex flex-col justify-center sm:block"
                style={{
                  background: h ? C.goldBg : C.s3,
                  border: `1px solid ${h ? C.gold + '30' : C.b1}`,
                }}
              >
                <div
                  className="whitespace-pre font-serif text-2xl sm:text-3xl font-bold leading-tight"
                  style={{ color: h ? C.gold2 : C.cream }}
                >
                  {n as string}
                </div>
                <div className="mt-1 font-sans text-[10px] sm:text-xs text-cream3 uppercase tracking-wider">{l as string}</div>
              </div>
            ))}
          </div>

          {/* Next Appointment */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-sans text-lg sm:text-xl font-semibold text-cream">Próxima Consulta</span>
              <span
                className="rounded-lg px-2 py-1 font-sans text-xs font-bold"
                style={{ background: 'rgba(196,145,42,0.14)', color: C.gold2 }}
              >
                em 20min
              </span>
            </div>

            <div
              className="tap flex items-center gap-4 rounded-2xl p-4 sm:p-5 hover:bg-goldBg/80 transition-colors"
              onClick={() => setOpenDetail((o) => !o)}
              style={{
                background: C.goldBg,
                border: `1px solid ${C.gold}2a`,
                borderBottomLeftRadius: openDetail ? 0 : undefined,
                borderBottomRightRadius: openDetail ? 0 : undefined,
              }}
            >
              <div
                className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
                style={{ background: 'rgba(196,145,42,0.1)' }}
              >
                <div className="font-sans text-xl font-bold leading-none text-gold2">12</div>
                <div className="mt-1 font-sans text-[10px] font-bold tracking-wider" style={{ color: C.gold3 + 'aa' }}>MAI</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 font-sans text-sm sm:text-base font-bold text-cream">Paulo Sauro</div>
                <div className="mb-1 font-sans text-xs sm:text-sm text-cream3">Corte Clássico · 10:00 · 40 min</div>
                <span className="font-sans text-sm font-bold text-gold2">R$ 40,00</span>
              </div>
              <span
                className="text-2xl text-gold2 transition-transform duration-200"
                style={{ transform: openDetail ? 'rotate(90deg)' : 'none' }}
              >
                →
              </span>
            </div>

            {openDetail && (
              <div className="animate-fade-up rounded-b-2xl border border-t-0 p-5" style={{ background: C.s2, borderColor: C.b2 }}>
                <div className="mb-2 font-sans text-xs sm:text-sm text-cream3 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconFileText size={14} /> Observações
                </div>
                <div className="mb-5 font-sans text-sm sm:text-base leading-relaxed text-cream">
                  Prefere tesoura. Corte baixo nas laterais, manter volume no topo.
                </div>
                <div className="flex gap-3">
                  <Btn variant="danger" style={{ height: 44, fontSize: 14 }}>Cancelar</Btn>
                  <Btn style={{ height: 44, fontSize: 14 }}>
                    <span className="flex items-center gap-1.5"><IconCheck size={14} /> Concluir</span>
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="mb-6 font-sans text-lg sm:text-xl font-semibold text-cream">Agenda de Hoje</div>
          <div className="flex flex-col gap-2">
            {ADMIN_TL.map((item, i) => {
              const isNext = item.status === 'next';
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 shrink-0 pt-3 text-right font-sans text-xs sm:text-sm font-medium text-cream3 tabular-nums">
                    {item.time}
                  </div>
                  <div className="flex shrink-0 flex-col items-center pt-4">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: tlDotColor[item.status],
                        boxShadow: isNext ? `0 0 12px ${C.gold2}` : 'none',
                      }}
                    />
                    {i < ADMIN_TL.length - 1 && (
                      <div className="mt-2 h-12 w-px" style={{ background: C.b1 }} />
                    )}
                  </div>
                  <div
                    className="mb-1 flex-1 rounded-2xl px-4 py-3 hover:bg-s3 transition-colors"
                    style={{
                      background: isNext ? C.goldBg : C.s2,
                      border: `1px solid ${isNext ? C.gold + '28' : C.b1}`,
                    }}
                  >
                    {item.client ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-sans text-sm sm:text-base font-bold" style={{ color: isNext ? C.gold2 : C.cream }}>
                            {item.client}
                          </div>
                          <div className="font-sans text-xs sm:text-sm text-cream3 mt-0.5">
                            {item.svc} · {item.dur}
                          </div>
                        </div>
                        <button className="tap border-none bg-transparent text-cream3 hover:text-cream">
                          <IconMoreVertical size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="font-sans text-sm text-cream3 font-medium flex items-center gap-2">
                        <IconClock size={16} /> {item.svc}
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
