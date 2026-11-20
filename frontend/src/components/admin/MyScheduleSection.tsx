import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError, errorMessage } from '../../api/client';
import { schedulingApi } from '../../api/endpoints';
import { DOW_NAMES } from '../../lib/dates';
import { TIME_OPTIONS, toWeeklyHours, toWorkingDays, type WeeklyHours } from '../../lib/weekly-hours';
import { C } from '../../theme';
import { Btn } from '../../ui';
import { IconClock, IconSave } from '../../ui/Icons';
import { Section } from './Section';
import { FIELD_LABEL, SELECT_STYLE, SMALL_BUTTON } from './styles';

type LoadState = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; hours: WeeklyHours };

export function MyScheduleSection() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    schedulingApi.mySchedule()
      .then(schedule => setState({ status: 'ready', hours: toWeeklyHours(schedule) }))
      .catch(error => {
        setState({ status: 'missing' });
        if (!(error instanceof ApiError && error.status === 404)) toast.error(errorMessage(error, 'Não foi possível carregar a escala.'));
      });
  }, []);

  const update = (changes: Partial<WeeklyHours>) =>
    setState(current => (current.status === 'ready' ? { status: 'ready', hours: { ...current.hours, ...changes } } : current));

  const toggleDay = (weekday: number, weekdays: number[]) =>
    update({ weekdays: weekdays.includes(weekday) ? weekdays.filter(d => d !== weekday) : [...weekdays, weekday] });

  const save = async (hours: WeeklyHours) => {
    if (hours.openTime >= hours.closeTime) {
      toast.error('A abertura deve ser antes do fechamento.');
      return;
    }
    setSaving(true);
    try {
      const saved = await schedulingApi.updateMySchedule(toWorkingDays(hours));
      setState({ status: 'ready', hours: toWeeklyHours(saved) });
      toast.success('Escala salva!');
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível salvar a escala.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section
      icon={<IconClock size={18} className="text-gold" />}
      title="Minha Escala"
      action={state.status === 'ready' && (
        <Btn onClick={() => save(state.hours)} loading={saving} style={SMALL_BUTTON}>
          <span className="flex items-center gap-1.5"><IconSave size={14} /> Salvar</span>
        </Btn>
      )}
    >
      {state.status === 'loading' && <p className="font-sans text-sm text-cream3">Carregando escala...</p>}
      {state.status === 'missing' && (
        <div className="rounded-xl p-4 font-sans text-sm" style={{ background: C.s3, color: C.cream3 }}>
          Sua conta não possui perfil de barbeiro, então não há escala para configurar.
        </div>
      )}
      {state.status === 'ready' && (
        <>
          <div className="mb-5">
            <span className={FIELD_LABEL}>Dias de atendimento</span>
            <div className="flex gap-2 flex-wrap">
              {DOW_NAMES.map((name, weekday) => {
                const active = state.hours.weekdays.includes(weekday);
                return (
                  <button key={name}
                    aria-pressed={active}
                    className="tap rounded-xl px-4 py-2.5 font-sans text-[11px] font-semibold transition-all"
                    style={{ background: active ? C.gold : 'transparent', color: active ? C.bg : C.cream2, border: `1px solid ${active ? C.gold : C.b1}` }}
                    onClick={() => toggleDay(weekday, state.hours.weekdays)}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {([['openTime', 'Abertura'], ['closeTime', 'Fechamento']] as const).map(([field, label]) => (
              <label key={field}>
                <span className={FIELD_LABEL}>{label}</span>
                <select value={state.hours[field]} onChange={e => update({ [field]: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 font-sans text-sm" style={SELECT_STYLE}>
                  {TIME_OPTIONS.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </label>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
