import type { Slot } from '../../api/types';
import { C } from '../../theme';

type SlotGridProps = {
  slots: Slot[];
  loading: boolean;
  error: string | null;
  selectedStartsAt?: string;
  onSelect: (slot: Slot | undefined) => void;
};

export function SlotGrid({ slots, loading, error, selectedStartsAt, onSelect }: SlotGridProps) {
  if (loading) return <p className="font-sans text-sm text-cream3 mb-4">Carregando horários...</p>;
  if (error) return <p className="font-sans text-sm mb-4" style={{ color: C.red }}>{error}</p>;
  if (slots.length === 0) {
    return <p className="text-center font-sans text-sm text-cream3 mb-4">Não há atendimento neste dia.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
      {slots.map(slot => {
        const isSelected = slot.startsAt === selectedStartsAt;
        const busy = !slot.available;
        return (
          <button
            key={slot.startsAt}
            disabled={busy}
            aria-pressed={isSelected}
            className={busy ? '' : 'tap hover:scale-105'}
            onClick={() => onSelect(isSelected ? undefined : slot)}
            style={{
              height: 48,
              borderRadius: 12,
              background: isSelected ? C.gold : busy ? C.s3 : C.s2,
              border: `1px solid ${isSelected ? C.gold : busy ? C.b1 : C.b2}`,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? '#0b0907' : busy ? C.cream3 : C.cream,
              opacity: busy ? 0.28 : 1,
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s',
              transform: busy ? 'scale(0.98)' : 'none',
            }}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}

export function SlotLegend() {
  return (
    <div className="flex gap-6 font-sans text-xs sm:text-sm text-cream3 mt-6 justify-center sm:justify-start">
      <span className="flex items-center gap-1.5"><span className="block w-3 h-3 rounded-sm border" style={{ borderColor: C.b2 }} /> Disponível</span>
      <span className="flex items-center gap-1.5" style={{ color: C.gold2 }}><span className="block w-3 h-3 rounded-sm" style={{ background: C.gold2 }} /> Selecionado</span>
      <span className="flex items-center gap-1.5" style={{ opacity: 0.5 }}><span className="block w-3 h-3 rounded-sm border" style={{ borderColor: C.b2 }} /> Ocupado</span>
    </div>
  );
}
