import { useState, useMemo, useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { adminApi } from '../api/endpoints';
import type { ApiUser, Appointment } from '../api/types';
import { STATUS_COLORS, STATUS_LABEL } from '../lib/appointment-status';
import { newestFirst, revenue } from '../lib/appointments';
import { dateParts, MONTH_ABBR } from '../lib/dates';
import { formatPrice, initials } from '../lib/format';
import { C } from '../theme';
import { IconSearch, IconUser, IconMail, IconClock, IconScissors, IconX } from '../ui/Icons';

const HISTORY_LIMIT = 10;

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AdminClientes() {
  const { appointments } = useAppointments();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clients, setClients] = useState<ApiUser[]>([]);
  useEffect(() => { adminApi.clients().then(setClients).catch(() => setClients([])); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q)
    );
  }, [clients, search]);

  const clientAppts = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of newestFirst(appointments)) {
      map.set(appointment.client.id, [...(map.get(appointment.client.id) ?? []), appointment]);
    }
    return map;
  }, [appointments]);

  function getStats(clientId: string) {
    const apps = clientAppts.get(clientId) || [];
    const total = apps.length;
    const completed = apps.filter(a => a.status !== 'canceled').length;
    return { total, completed, totalSpent: revenue(apps) };
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream flex items-center gap-3">
          <IconUser size={24} className="text-gold" /> Clientes
        </h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <IconSearch size={18} style={{ color: C.cream3 }} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
            className="flex-1 border-none bg-transparent font-sans text-sm text-cream outline-none placeholder:text-cream3/50"
          />
          {search && (
            <button className="tap" onClick={() => setSearch('')}>
              <IconX size={16} style={{ color: C.cream3 }} />
            </button>
          )}
        </div>
      </div>

      {/* Client list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <IconUser size={32} style={{ color: C.cream3 }} />
            <p className="font-sans text-sm" style={{ color: C.cream3 }}>
              {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
          </div>
        ) : (
          filtered.map(client => {
            const isOpen = expandedId === client.id;
            const stats = getStats(client.id);
            const history = clientAppts.get(client.id) ?? [];

            return (
              <div key={client.id} className="rounded-2xl overflow-hidden"
                style={{ background: C.s2, border: `1px solid ${isOpen ? `${C.gold}28` : C.b1}` }}>
                <div className="tap flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isOpen ? null : client.id)}>

                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold"
                    style={{ background: `${C.gold}20`, color: C.gold2 }}>
                    {initials(client.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm font-bold text-cream truncate">{client.name}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.email && (
                        <span className="font-sans text-xs" style={{ color: C.cream3 }}>
                          <IconMail size={10} className="inline mr-1" />{client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="font-sans text-xs" style={{ color: C.cream3 }}>{client.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 mr-2">
                    <div className="text-center">
                      <div className="font-sans text-sm font-bold" style={{ color: C.gold2 }}>{stats.completed}</div>
                      <div className="font-sans text-[9px] uppercase tracking-wider" style={{ color: C.cream3 }}>Visitas</div>
                    </div>
                    <div className="w-px h-6" style={{ background: C.b1 }} />
                    <div className="text-center">
                      <div className="font-sans text-sm font-bold tabular-nums" style={{ color: C.gold2 }}>{formatPrice(stats.totalSpent)}</div>
                      <div className="font-sans text-[9px] uppercase tracking-wider" style={{ color: C.cream3 }}>Gasto</div>
                    </div>
                  </div>

                  <span className="font-sans text-cream3 text-xl shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3" style={{ borderTop: `1px solid ${C.gold}20` }}>
                    {/* Client details */}
                    <div className="mb-4 rounded-xl p-3 font-sans text-sm space-y-1.5" style={{ background: C.s3, color: C.cream }}>
                      <div className="flex items-center gap-2">
                        <IconMail size={13} style={{ color: C.cream3 }} /> {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
                        Telefone: {client.phone || 'Não informado'}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
                        Cliente desde: {formatDate(client.createdAt)}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
                        <IconScissors size={11} /> {stats.total} agendamento{stats.total !== 1 ? 's' : ''} · {stats.completed} concluído{stats.completed !== 1 ? 's' : ''}
                      </div>
                      {stats.totalSpent > 0 && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: C.gold2 }}>
                          Total gasto: {formatPrice(stats.totalSpent)}
                        </div>
                      )}
                    </div>

                    {/* Appointment history */}
                    {history.length > 0 && (
                      <>
                        <div className="mb-2 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.cream3 }}>
                          <IconClock size={13} /> Histórico de agendamentos
                        </div>
                        <div className="flex flex-col gap-2">
                          {history.slice(0, HISTORY_LIMIT).map(appt => {
                              const statusColor = STATUS_COLORS[appt.status];
                              return (
                                <div key={appt.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                  style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-sans text-xs font-semibold text-cream truncate">{appt.service.name}</div>
                                    <div className="font-sans text-[10px]" style={{ color: C.cream3 }}>
                                      {formatDate(appt.startsAt)} · {dateParts(appt.startsAt).time}
                                    </div>
                                  </div>
                                  <span className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                    style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                                    {STATUS_LABEL[appt.status]}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                        {history.length > HISTORY_LIMIT && (
                          <p className="mt-2 font-sans text-[11px] text-center" style={{ color: C.cream3 }}>
                            + {history.length - HISTORY_LIMIT} agendamento(s) anterior(es)
                          </p>
                        )}
                      </>
                    )}

                    {history.length === 0 && (
                      <div className="rounded-xl p-4 text-center font-sans text-xs" style={{ background: C.s3, color: C.cream3 }}>
                        Nenhum agendamento encontrado
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
      <div className="mt-6 rounded-2xl p-4 flex items-center justify-center gap-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
        <div className="text-center">
          <div className="font-serif text-lg font-bold" style={{ color: C.gold2 }}>{clients.length}</div>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>Total</div>
        </div>
        <div className="w-px h-8" style={{ background: C.b1 }} />
        <div className="text-center">
          <div className="font-serif text-lg font-bold" style={{ color: C.gold2 }}>{filtered.length}</div>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: C.cream3 }}>Na busca</div>
        </div>
      </div>
    </div>
  );
}
