const STATUS_MAP: Record<string, { bg: string; c: string; label: string }> = {
  confirmed: { bg: 'rgba(74,157,110,0.14)',  c: '#4a9d6e', label: 'Confirmado' },
  pending:   { bg: 'rgba(196,145,42,0.12)',  c: '#d4a84c', label: 'Pendente'   },
  done:      { bg: '#262320',                c: '#6a5c44', label: 'Concluído'  },
  next:      { bg: 'rgba(196,145,42,0.18)',  c: '#d4a84c', label: 'Próximo'    },
  upcoming:  { bg: '#1d1a16',                c: '#6a5c44', label: 'Agendado'   },
  break:     { bg: '#1d1a16',                c: '#6a5c44', label: 'Pausa'      },
  canceled:  { bg: 'rgba(192,80,80,0.12)',   c: '#c05050', label: 'Cancelado'  },
};

export function Badge({ status }: { status: string }) {
  const st = STATUS_MAP[status] || STATUS_MAP.done;
  return (
    <span
      className="inline-block rounded-md px-2.5 py-0.5 font-sans text-[11px] font-semibold whitespace-nowrap"
      style={{ background: st.bg, color: st.c }}
    >
      {st.label}
    </span>
  );
}
