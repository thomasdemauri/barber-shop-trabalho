import { useMemo, useState } from 'react';
import { fromDateKey, monthGrid, monthLabel, type CalendarDay } from '../../lib/dates';
import { C } from '../../theme';

const WEEKDAY_HEADERS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

type MonthCalendarProps = {
  selectedDateKey?: string;
  /** Weekdays (0 = Sunday) that can be picked; past days are never selectable. */
  workingWeekdays: Set<number>;
  onSelect: (dateKey: string | undefined) => void;
  today?: Date;
};

export function MonthCalendar({ selectedDateKey, workingWeekdays, onSelect, today: todayProp }: MonthCalendarProps) {
  const [today] = useState(() => todayProp ?? new Date());
  const [view, setView] = useState(() => {
    const start = selectedDateKey ? fromDateKey(selectedDateKey) : today;
    return { year: start.getFullYear(), month: start.getMonth() };
  });
  const days = useMemo(() => monthGrid(view.year, view.month, today), [view, today]);

  const shiftMonth = (delta: number) => setView(({ year, month }) => {
    const next = new Date(year, month + delta, 1);
    return { year: next.getFullYear(), month: next.getMonth() };
  });
  const isSelectable = (day: CalendarDay) => !day.isPast && workingWeekdays.has(day.weekday);

  return (
    <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
      <div className="mb-6 flex items-center justify-between px-2">
        <button
          aria-label="Mês anterior"
          className="tap border-none bg-transparent text-2xl sm:text-3xl leading-none text-cream3 hover:text-cream"
          onClick={() => shiftMonth(-1)}
        >←</button>
        <span className="font-sans text-base sm:text-lg font-bold text-cream">{monthLabel(view.year, view.month)}</span>
        <button
          aria-label="Próximo mês"
          className="tap border-none bg-transparent text-2xl sm:text-3xl leading-none text-cream3 hover:text-cream"
          onClick={() => shiftMonth(1)}
        >→</button>
      </div>
      <div className="mb-3 grid grid-cols-7 gap-2">
        {WEEKDAY_HEADERS.map(header => (
          <div key={header} className="text-center font-sans text-[10px] sm:text-xs font-medium text-cream3">{header}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} />;
          const isSelected = day.dateKey === selectedDateKey;
          const selectable = isSelectable(day);
          return (
            <button
              key={day.dateKey}
              aria-pressed={isSelected}
              aria-label={day.dateKey}
              disabled={!selectable}
              className={selectable ? 'tap hover:ring-2 ring-gold/30' : ''}
              onClick={() => onSelect(isSelected ? undefined : day.dateKey)}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                fontWeight: isSelected ? 700 : day.isToday ? 600 : 400,
                background: isSelected ? C.gold : day.isToday ? C.s3 : 'transparent',
                color: isSelected ? '#0b0907' : selectable ? C.cream : C.cream3,
                border: day.isToday && !isSelected ? `1px solid ${C.b2}` : 'none',
                opacity: !selectable && !isSelected && !day.isToday ? 0.3 : 1,
                cursor: selectable ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
